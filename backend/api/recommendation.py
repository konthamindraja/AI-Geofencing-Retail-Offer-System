import sys
import os

# Adjust path to import retail_agent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "retail_agent", "src")))

from retail_agent.crew import RetailAgent

def generate_offer_for_customer(customer_id: str, purchase_history: str) -> str:
    """
    Kicks off the RetailAgent CrewAI to fetch a personalized offer.
    """
    inputs = {
        'customer_id': customer_id,
        'purchase_history': purchase_history
    }
    try:
        crew = RetailAgent().crew()
        result = crew.kickoff(inputs=inputs)
        return str(result)
    except Exception as e:
        # Fallback offer in case of error
        print(f"Error in generating offer: {e}")
        return f"10% off your next purchase"
