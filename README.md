Team Echo
Studen 1-Divya Sajjanar (1MS24EC032)
Student 2-Harshitha C P (1MS24CS067)
# Next-Gen Kannada Grammar Engine

## Project Description
This project aims to build an automated system for correcting grammatical errors in spoken Kannada. It focuses on converting speech to text, identifying grammatical mistakes (specifically Subject-Verb Agreement and Word Order issues), and then automatically correcting them to produce grammatically accurate Kannada sentences.

## Hackathon Context: Modalapada AI Hackathon (Problem Statement 3)
This project addresses Problem Statement 3: "Kannada Sentence Structure Corrector" of the Modalapada AI Hackathon. The goal is to develop a web application capable of real-time correction of complex Kannada sentences from continuous speech input.

## Tech Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (for real-time speech input and display)
*   **Backend (Planned):** Python (for advanced NLP, POS Tagging, Agreement Checking, Word Order Correction)

## Project Structure
```
TeamName_GrammarCorrector/
├── index.html
├── style.css
├── script.js
├── voice_recordings/       # MP4 audio files with example sentences
│   ├── easy_sentences.mp4
│   ├── medium_sentences.mp4
│   └── complex_sentences.mp4
├── transcripts/            # Text files of recognized and corrected sentences
│   ├── easy_recognized.txt
│   ├── easy_corrected.txt
│   ├── medium_recognized.txt
│   ├── medium_corrected.txt
│   ├── complex_recognized.txt
│   └── complex_corrected.txt
├── datasets/               # Linguistic datasets for grammar rules
│   ├── pos_tags.csv
│   ├── verb_conjugations.csv
│   └── word_order_rules.csv
├── correction_logs/        # CSV files logging corrections made by the system
│   ├── easy_corrections.csv
│   ├── medium_corrections.csv
│   └── complex_corrections.csv
├── code/                   # Python backend modules for NLP pipeline
│   ├── speech_to_text.py
│   ├── pos_tagger.py
│   ├── agreement_checker.py
│   ├── word_order_fixer.py
│   ├── dictionary_utils.py  # Padakanaja dictionary integration
│   └── main_pipeline.py
├── metadata.json           # Speaker info, dialect details, project metadata
└── README.md               # Project documentation (this file)
```

## Setup and Installation

### Frontend Setup
1.  Open `index.html` in a modern web browser (e.g., Google Chrome).
2.  Click the "Start Recording" button and speak in Kannada.
3.  The "You Said" box will display your recognized speech, and the "AI Corrected" box will show the corrected text (with basic subject-verb agreement).

### Backend Setup
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Ensure all dataset CSV files are populated in the `datasets/` directory.
3. Run the main pipeline:
   ```bash
   python code/main_pipeline.py
   ```

## Dictionary Integration
This project integrates with **Padakanaja** - the Karnataka Government's Open Dictionary, which is a comprehensive Kannada and English dictionary provided by Karnataka Sahitya Parishat.

- **Reference URL:** https://padakanaja.karnataka.gov.in/open_dictionary/
- **Integration Module:** `code/dictionary_utils.py`
- **Purpose:** Used as a reference data source for:
  - Validating word genders
  - Determining POS (Part-of-Speech) tags
  - Extracting word meanings and grammatical information
  - Enhancing local datasets with authoritative dictionary data

**Note:** Since Padakanaja doesn't provide a public API, the integration module includes utilities for web scraping/parsing (with respect to terms of service) or can be used as a reference for manual dataset population.

## Backend Development (To be Implemented)
The Python files in the `code/` directory are currently placeholders. The actual implementation of the sophisticated NLP logic, including advanced POS tagging, agreement checking, and word order correction, would reside here. This backend would typically be exposed via an API that the frontend (`script.js`) could then consume.

**Key Backend Modules:**
- `speech_to_text.py` - Converts Kannada speech to text
- `pos_tagger.py` - Performs Part-of-Speech tagging
- `agreement_checker.py` - Checks subject-verb agreement
- `word_order_fixer.py` - Corrects word order to SOV structure
- `dictionary_utils.py` - Integrates with Padakanaja dictionary
- `main_pipeline.py` - Orchestrates the complete correction pipeline

## Deployment Notes
For deployment, the frontend (HTML, CSS, JS) can be hosted on any static file server. The Python backend would require a server environment (e.g., Flask, FastAPI) and potentially cloud services for speech recognition and NLP models.

## Contributors
[Your Name/Team Name Here]
