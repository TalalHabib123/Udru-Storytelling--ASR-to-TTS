from fastapi import WebSocket
import json

client_categories = {}

async def handle_text_message(websocket: WebSocket, message: str, file_id: str = None):
    """
    Handles incoming text messages, which are expected to be JSON data.
    Example JSON:
    {
      "categories": ["cat1", "cat2", "cat3"],
      "description": "Some description",
      "other_info": 123
    }
    """
    try:
        json_data = json.loads(message)

        # Validate that `categories` is a list if it exists
        categories = json_data.get("categories", [])
        if not isinstance(categories, list):
            categories = []
        
        print(f"Received JSON data from {websocket.client}: {json_data}")

        # Here you can process the categories and other data as needed.
        # For demonstration, we just return a success response with received data.
        response = {
            "status": "JSON received",
            "received_categories": categories,
            "original_data": json_data
        }
        client_categories[file_id] = categories
        return response
    except json.JSONDecodeError:
        # If the text isn't valid JSON, respond accordingly.
        print(f"Received non-JSON text from {websocket.client}: {message}")
        response = {
            "status": "error",
            "message": "Invalid JSON format"
        }
        return response