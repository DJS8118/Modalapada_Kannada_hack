# code/dictionary_utils.py
"""
Dictionary Utilities Module
Integration with Padakanaja Kannada Dictionary (Karnataka Government)
Reference: https://padakanaja.karnataka.gov.in/open_dictionary/

This module provides utilities to:
1. Look up words in the Padakanaja dictionary
2. Extract word information (gender, POS, meanings)
3. Enhance our local datasets with dictionary data
"""

import requests
import pandas as pd
from bs4 import BeautifulSoup
import time
import json
import os

# Padakanaja Dictionary Base URL
PADAKANAJA_BASE_URL = "https://padakanaja.karnataka.gov.in/open_dictionary/"


def lookup_word_padakanaja(word):
    """
    Look up a word in the Padakanaja dictionary.
    Note: Since there's no public API, this attempts to parse the web interface.
    
    Args:
        word (str): Kannada word to look up
        
    Returns:
        dict: Dictionary containing word information (gender, POS, meaning, etc.)
              Returns None if lookup fails
    """
    try:
        # Construct URL (format may vary - adjust based on actual website structure)
        encoded_word = word  # URL encoding would be handled by requests if needed
        url = f"{PADAKANAJA_BASE_URL}{encoded_word}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Parse the dictionary page (adjust selectors based on actual HTML structure)
            # This is a placeholder - actual parsing logic would depend on the page structure
            word_info = {
                'word': word,
                'meaning': None,
                'gender': None,
                'pos_tag': None,
                'source': 'padakanaja'
            }
            
            # Example parsing (adjust based on actual HTML structure):
            # meaning_div = soup.find('div', class_='meaning')  # Adjust selector
            # if meaning_div:
            #     word_info['meaning'] = meaning_div.get_text().strip()
            
            return word_info
        else:
            print(f"Failed to fetch word '{word}': HTTP {response.status_code}")
            return None
            
    except requests.RequestException as e:
        print(f"Error looking up word '{word}': {e}")
        return None
    except Exception as e:
        print(f"Unexpected error looking up word '{word}': {e}")
        return None


def enhance_pos_tags_with_dictionary(pos_tags_csv_path="datasets/pos_tags.csv"):
    """
    Enhance the POS tags CSV with data from Padakanaja dictionary.
    This function looks up words that don't have complete information and fills in missing data.
    
    Args:
        pos_tags_csv_path (str): Path to the POS tags CSV file
        
    Returns:
        pandas.DataFrame: Enhanced POS tags dataframe
    """
    try:
        # Load existing POS tags
        df = pd.read_csv(pos_tags_csv_path)
        
        # Find words with incomplete information (example: missing gender or POS)
        incomplete_words = df[df['features'].isna() | (df['pos_tag'] == 'UNKNOWN')]
        
        print(f"Found {len(incomplete_words)} words with incomplete information.")
        print("Enhancing with Padakanaja dictionary data...")
        
        for index, row in incomplete_words.iterrows():
            word = row['word']
            print(f"Looking up: {word}")
            
            word_info = lookup_word_padakanaja(word)
            
            if word_info:
                # Update the dataframe with dictionary information
                if word_info.get('pos_tag') and row['pos_tag'] == 'UNKNOWN':
                    df.at[index, 'pos_tag'] = word_info['pos_tag']
                
                if word_info.get('gender'):
                    # Add gender to features
                    current_features = row['features'] if pd.notna(row['features']) else ""
                    if 'gender' not in current_features:
                        new_features = f"{current_features};gender={word_info['gender']}" if current_features else f"gender={word_info['gender']}"
                        df.at[index, 'features'] = new_features
            
            # Be respectful - add a small delay between requests
            time.sleep(0.5)
        
        # Save enhanced data
        df.to_csv(pos_tags_csv_path, index=False, encoding='utf-8')
        print(f"Enhanced POS tags saved to {pos_tags_csv_path}")
        
        return df
        
    except FileNotFoundError:
        print(f"Error: {pos_tags_csv_path} not found.")
        return pd.DataFrame()
    except Exception as e:
        print(f"Error enhancing POS tags: {e}")
        return pd.DataFrame()


def batch_lookup_words(words_list, output_file="datasets/dictionary_lookup_results.json"):
    """
    Batch look up multiple words from Padakanaja dictionary.
    Results are saved to a JSON file for later use.
    
    Args:
        words_list (list): List of Kannada words to look up
        output_file (str): Path to save the results JSON file
        
    Returns:
        dict: Dictionary mapping words to their information
    """
    results = {}
    
    print(f"Looking up {len(words_list)} words in Padakanaja dictionary...")
    
    for i, word in enumerate(words_list, 1):
        print(f"[{i}/{len(words_list)}] Looking up: {word}")
        word_info = lookup_word_padakanaja(word)
        
        if word_info:
            results[word] = word_info
        
        # Be respectful - add delay between requests
        time.sleep(0.5)
    
    # Save results to JSON file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Results saved to {output_file}")
    except Exception as e:
        print(f"Error saving results: {e}")
    
    return results


def create_dictionary_reference_file():
    """
    Create a reference file documenting the Padakanaja dictionary integration.
    """
    reference_info = {
        "dictionary_name": "Padakanaja - Karnataka Government Open Dictionary",
        "url": "https://padakanaja.karnataka.gov.in/open_dictionary/",
        "description": "Comprehensive Kannada and English dictionary provided by Karnataka Sahitya Parishat",
        "integration_status": "Reference data source (no public API available)",
        "usage": "Used as reference for validating word genders, POS tags, and meanings",
        "data_extraction": "Web scraping/parsing possible but requires compliance with terms of service",
        "alternative_apis": [
            {
                "name": "Shabdkosh",
                "url": "https://www.shabdkosh.com/",
                "note": "Provides bilingual dictionary APIs with Kannada support"
            }
        ]
    }
    
    reference_file = "datasets/dictionary_reference.json"
    try:
        with open(reference_file, 'w', encoding='utf-8') as f:
            json.dump(reference_info, f, ensure_ascii=False, indent=2)
        print(f"Dictionary reference file created: {reference_file}")
    except Exception as e:
        print(f"Error creating reference file: {e}")


if __name__ == "__main__":
    # Create dictionary reference file
    create_dictionary_reference_file()
    
    # Example: Look up a few words
    sample_words = ["ನಾನು", "ಹೋಗು", "ಪುಸ್ತಕ"]
    print("\nExample: Looking up sample words...")
    results = batch_lookup_words(sample_words)
    print(f"\nLookup results: {json.dumps(results, ensure_ascii=False, indent=2)}")
    
    # Example: Enhance POS tags (uncomment if you want to run this)
    # enhance_pos_tags_with_dictionary()

