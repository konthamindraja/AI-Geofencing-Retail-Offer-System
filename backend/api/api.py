from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .dataset_loader import load_stores, load_purchases
from .geofence import find_nearby_store
from .recommendation import generate_offer_for_customer

app = FastAPI(title="AI-Driven Geofencing Offer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

class LocationUpdate(BaseModel):
    customer_id: str
    latitude: float
    longitude: float

class OfferRequest(BaseModel):
    customer_id: str

@app.get("/stores")
def get_stores():
    try:
        stores_df = load_stores()
        return stores_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-customer")
def detect_customer(location: LocationUpdate):
    try:
        stores_df = load_stores()
        nearby_store = find_nearby_store(location.latitude, location.longitude, stores_df)
        
        if nearby_store is None:
            return {"message": "Customer is not near any store"}
        
        # Get purchase history
        purchases_df = load_purchases()
        customer_purchases = purchases_df[purchases_df['customer_id'] == location.customer_id]['item'].tolist()
        purchase_history = ", ".join(customer_purchases) if customer_purchases else "No prior purchases"
        
        offer = generate_offer_for_customer(location.customer_id, purchase_history)
        
        return {
            "store": nearby_store['store_name'],
            "offer": offer.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-offer")
def generate_offer_endpoint(req: OfferRequest):
    try:
        purchases_df = load_purchases()
        customer_purchases = purchases_df[purchases_df['customer_id'] == req.customer_id]['item'].tolist()
        
        if not customer_purchases:
             purchase_history = "No prior purchases"
        else:
             purchase_history = ", ".join(customer_purchases)
             
        offer = generate_offer_for_customer(req.customer_id, purchase_history)
        return {"offer": offer.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/customer-logs/{customer_id}")
def get_customer_logs(customer_id: str):
    try:
        purchases_df = load_purchases()
        customer_data = purchases_df[purchases_df['customer_id'] == customer_id]

        if customer_data.empty:
            return {"customer_id": customer_id, "logs": [], "interests": [], "discounts": [], "total_savings": 0}

        # Build purchase logs
        logs = customer_data.to_dict(orient="records")

        # Analyze interests: items purchased more than once
        item_counts = customer_data.groupby('item').agg(
            purchase_count=('item', 'count'),
            category=('category', 'first'),
            total_qty=('quantity', 'sum'),
            avg_price=('price', 'mean'),
            total_spent=('price', 'sum')
        ).reset_index()

        # Items bought 2+ times are "interests"
        interests_df = item_counts[item_counts['purchase_count'] >= 2].sort_values('purchase_count', ascending=False)
        interests = interests_df.to_dict(orient="records")

        # Generate discount offers for interested products with savings
        discounts = []
        total_savings = 0
        for _, row in interests_df.iterrows():
            if row['purchase_count'] >= 5:
                discount_pct = 30
            elif row['purchase_count'] >= 4:
                discount_pct = 25
            elif row['purchase_count'] >= 3:
                discount_pct = 20
            elif row['purchase_count'] >= 2:
                discount_pct = 10
            else:
                discount_pct = 5

            original_price = round(float(row['avg_price']), 2)
            savings_per_unit = round(original_price * discount_pct / 100, 2)
            discounted_price = round(original_price - savings_per_unit, 2)
            total_savings += savings_per_unit

            discounts.append({
                "item": row['item'],
                "category": row['category'],
                "discount": f"{discount_pct}% off {row['item']}",
                "discount_pct": discount_pct,
                "original_price": original_price,
                "discounted_price": discounted_price,
                "savings_per_unit": savings_per_unit,
                "total_qty_purchased": int(row['total_qty']),
                "total_spent": round(float(row['total_spent']), 2),
                "reason": f"Purchased {int(row['purchase_count'])} times (total {int(row['total_qty'])} units)"
            })

        return {
            "customer_id": customer_id,
            "logs": logs,
            "interests": interests,
            "discounts": discounts,
            "total_savings": round(total_savings, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Offer Claiming System ----
claimed_offers_db = {}  # In-memory store: { customer_id: [claimed_offer, ...] }

class ClaimOfferRequest(BaseModel):
    customer_id: str
    store_name: str
    offer_text: str
    claimed_at: str = ""

@app.post("/claim-offer")
def claim_offer(req: ClaimOfferRequest):
    try:
        import datetime
        if req.customer_id not in claimed_offers_db:
            claimed_offers_db[req.customer_id] = []

        # Check if already claimed
        for existing in claimed_offers_db[req.customer_id]:
            if existing["store_name"] == req.store_name and existing["offer_text"] == req.offer_text:
                return {"status": "already_claimed", "message": "This offer has already been claimed!"}

        claim = {
            "claim_id": f"CLM-{len(claimed_offers_db[req.customer_id]) + 1:04d}",
            "customer_id": req.customer_id,
            "store_name": req.store_name,
            "offer_text": req.offer_text,
            "claimed_at": req.claimed_at or datetime.datetime.now().isoformat(),
            "status": "claimed",
            "redeemed": False
        }
        claimed_offers_db[req.customer_id].append(claim)

        return {
            "status": "success",
            "message": f"Offer claimed successfully at {req.store_name}!",
            "claim": claim
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/claimed-offers/{customer_id}")
def get_claimed_offers(customer_id: str):
    return {
        "customer_id": customer_id,
        "offers": claimed_offers_db.get(customer_id, [])
    }

@app.post("/redeem-offer")
def redeem_offer(req: ClaimOfferRequest):
    try:
        if req.customer_id not in claimed_offers_db:
            raise HTTPException(status_code=404, detail="No claimed offers found")

        for offer in claimed_offers_db[req.customer_id]:
            if offer["store_name"] == req.store_name and offer["offer_text"] == req.offer_text:
                if offer["redeemed"]:
                    return {"status": "already_redeemed", "message": "This offer has already been redeemed!"}
                offer["redeemed"] = True
                offer["status"] = "redeemed"
                return {"status": "success", "message": "Offer redeemed successfully!", "offer": offer}

        raise HTTPException(status_code=404, detail="Offer not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
