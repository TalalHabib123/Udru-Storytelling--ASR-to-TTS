import json
import requests


system_prompt = """You are a storytelling AI assistant that writes stories in Urdu script.
        You need to write a creative story in Urdu based on the topic and theme provided by the user.
        Make the story interesting and fluent, and do not use any words outside of the Urdu script.
        Limit the story to a maximum length of 200 words.
        Always start the story with a proper introduction.
        Never end the story abruptly, and always conclude it logically.
        Absolutely never include a word that is not in Urdu font."""

theme = "horror"

def query_model(user_prompt):
    """
    Sends a prompt to Gemma2 via Ollama and streams the response.
    """
    url = "http://localhost:11434/api/generate"
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    payload = {
        "model": "gemma2",
        "prompt": full_prompt,
        "stream": False
    }
    # IF Streaming true
    # try:
    #     with requests.post(url, json=payload, stream=True) as response:
    #         if response.status_code == 200:
    #             for line in response.iter_lines():
    #                 if line:
    #                     decoded_line = line.decode('utf-8')
    #                     json_line = json.loads(decoded_line)
    #                     if 'response' in json_line:
    #                         yield json_line['response']
    #         else:
    #             print(f"Error: {response.status_code} - {response.text}")
    #             yield f"Error: Failed to get response from LLaMA. Status code: {response.status_code}"

    # except requests.exceptions.RequestException as e:
    #     print(f"Request error: {e}")
    #     yield "Error: An error occurred while making the request."
    ## IF Streaming false
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            decoded_response = response.json()
            if 'response' in decoded_response:
                return decoded_response['response']
            else:
                return "Error: No response field in the returned JSON."
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return f"Error: Failed to get response from LLaMA. Status code: {response.status_code}"

    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return "Error: An error occurred while making the request."