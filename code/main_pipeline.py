# code/main_pipeline.py
from code.speech_to_text import convert_speech_to_text
from code.pos_tagger import load_pos_tags, pos_tag_sentence
from code.agreement_checker import load_verb_conjugations, check_agreement
from code.word_order_fixer import load_word_order_rules, fix_word_order

import os
import json

def run_grammar_correction_pipeline(audio_file_path):
    """
    Runs the complete Kannada grammar correction pipeline.
    """
    print(f"Starting grammar correction pipeline for {audio_file_path}...")

    # 1. Speech-to-Text Conversion
    recognized_text = convert_speech_to_text(audio_file_path)
    print(f"Recognized Text: {recognized_text}")

    # Load linguistic datasets
    pos_tags_df = load_pos_tags()
    verb_conjugations_df = load_verb_conjugations()
    word_order_rules_df = load_word_order_rules()

    if pos_tags_df.empty or verb_conjugations_df.empty or word_order_rules_df.empty:
        print("Error: One or more linguistic datasets could not be loaded. Exiting pipeline.")
        return None, None

    # 2. POS Tagging
    tagged_sentence = pos_tag_sentence(recognized_text, pos_tags_df)
    print(f"POS Tagged Sentence: {tagged_sentence}")

    # 3. Agreement Checking
    has_agreement_error, agreement_correction = check_agreement(tagged_sentence, verb_conjugations_df)
    if has_agreement_error:
        print(f"Agreement Error Detected: {agreement_correction}")
        # Apply agreement correction here if needed

    # 4. Word Order Correction
    corrected_words = fix_word_order(tagged_sentence, word_order_rules_df)
    final_corrected_sentence = " ".join(corrected_words)
    print(f"Final Corrected Sentence: {final_corrected_sentence}")

    return recognized_text, final_corrected_sentence

def create_metadata_file(team_name="TeamName_GrammarCorrector", dialect="Standard Kannada", speaker_info=""):
    metadata = {
        "team_name": team_name,
        "dialect": dialect,
        "speaker_info": speaker_info,
        "date_created": "", # Placeholder
        "version": "1.0"
    }
    try:
        with open("metadata.json", 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)
        print("metadata.json created successfully.")
    except Exception as e:
        print(f"Error creating metadata.json: {e}")

if __name__ == "__main__":
    # Ensure directories exist (for local testing without full setup)
    os.makedirs("voice_recordings", exist_ok=True)
    os.makedirs("transcripts", exist_ok=True)
    os.makedirs("datasets", exist_ok=True)
    os.makedirs("correction_logs", exist_ok=True)
    os.makedirs("code", exist_ok=True)

    # Create dummy dataset files if they don't exist for pipeline to run without error
    # (In a real scenario, these would be populated with actual data)
    if not os.path.exists("datasets/pos_tags.csv"):
        with open("datasets/pos_tags.csv", 'w', encoding='utf-8') as f:
            f.write("word,pos_tag,features\nನಾನು,PRONOUN,person=1st;number=singular")
    if not os.path.exists("datasets/verb_conjugations.csv"):
        with open("datasets/verb_conjugations.csv", 'w', encoding='utf-8') as f:
            f.write("verb_root,1st_singular,2nd_singular,3rd_masc_singular,3rd_fem_singular,1st_plural,3rd_plural\nಹೋಗು,ಹೋಗುತ್ತೇನೆ,ಹೋಗುತ್ತೀಯಾ,ಹೋಗುತ್ತಾನೆ,ಹೋಗುತ್ತಾಳೆ,ಹೋಗುತ್ತೇವೆ,ಹೋಗುತ್ತಾರೆ")
    if not os.path.exists("datasets/word_order_rules.csv"):
        with open("datasets/word_order_rules.csv", 'w', encoding='utf-8') as f:
            f.write("rule_id,pattern,description\n1,SOV,Standard Kannada sentence structure")

    # Create metadata.json
    create_metadata_file(speaker_info="Example Speaker")

    # Example usage (you'd replace 'dummy_audio.mp4' with actual audio files)
    dummy_audio_path = "voice_recordings/easy_sentences.mp4"
    if not os.path.exists(dummy_audio_path):
        # Create a dummy file for testing purposes
        with open(dummy_audio_path, 'w') as f:
            f.write("dummy audio content") # This is not a real audio file

    recognized, corrected = run_grammar_correction_pipeline(dummy_audio_path)
    if recognized and corrected:
        print("Pipeline finished successfully.")

        # Example of saving to transcripts (you'd implement more robust saving logic)
        with open("transcripts/easy_recognized.txt", 'w', encoding='utf-8') as f:
            f.write(recognized)
        with open("transcripts/easy_corrected.txt", 'w', encoding='utf-8') as f:
            f.write(corrected)
    else:
        print("Pipeline encountered an error.")
