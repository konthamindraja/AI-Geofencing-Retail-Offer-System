from geopy.distance import great_circle

def is_customer_within_radius(customer_lat, customer_lon, store_lat, store_lon, radius=100):
    """
    Returns True if the customer is within `radius` meters of the store.
    """
    customer_coords = (customer_lat, customer_lon)
    store_coords = (store_lat, store_lon)
    distance = great_circle(customer_coords, store_coords).meters
    return distance <= radius

def find_nearby_store(customer_lat, customer_lon, stores_dataframe):
    """
    Returns the nearest store within the 100 meter geofence radius.
    """
    nearest_store = None
    min_distance = float('inf')
    
    for _, store in stores_dataframe.iterrows():
        if is_customer_within_radius(customer_lat, customer_lon, store['latitude'], store['longitude'], radius=100):
            customer_coords = (customer_lat, customer_lon)
            store_coords = (store['latitude'], store['longitude'])
            distance = great_circle(customer_coords, store_coords).meters
            
            if distance < min_distance:
                min_distance = distance
                nearest_store = store
                
    return nearest_store
