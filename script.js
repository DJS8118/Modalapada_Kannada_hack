// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

// ============================================================================
// KANNADA DATABASE - Comprehensive Grammar Rules
// ============================================================================
const KANNADA_DB = {
    // Masculine subjects (pronouns + common nouns)
    masculine: [
        'ಅವನು', 'ಇವನು', 'ಹುಡುಗ', 'ತಂದೆ', 'ಅಪ್ಪ', 'ತಮ್ಮ', 'ಅಣ್ಣ', 'ಮಗ', 
        'ಗಂಡ', 'ರಾಜ', 'ರಾಮ', 'ಶಿಷ್ಯ', 'ಸ್ನೇಹಿತ', 'ಡಾಕ್ಟರ್', 'ಪೊಲೀಸ್', 
        'ಶಿಕ್ಷಕ', 'ಹುಡುಗನು', 'ಮನುಷ್ಯ', 'ರಾಮನು', 'ಕೃಷ್ಣನು'
    ],
    
    // Feminine subjects (pronouns + common nouns)
    feminine: [
        'ಅವಳು', 'ಇವಳು', 'ಹುಡುಗಿ', 'ತಾಯಿ', 'ಅಮ್ಮ', 'ತಂಗಿ', 'ಅಕ್ಕ', 'ಮಗಳು', 
        'ಹೆಂಡತಿ', 'ರಾಣಿ', 'ಸೀತೆ', 'ಶಿಷ್ಯೆ', 'ಸ್ನೇಹಿತೆ', 'ಶಿಕ್ಷಕಿ', 'ಹುಡುಗಿಯು', 
        'ಮಹಿಳೆ', 'ಲಕ್ಷ್ಮಿ', 'ಸರಸ್ವತಿ'
    ],
    
    // Plural subjects (pronouns + common nouns)
    plural: [
        'ಅವರು', 'ನಾವು', 'ಮಕ್ಕಳು', 'ಜನರು', 'ವಿದ್ಯಾರ್ಥಿಗಳು', 'ಶಿಕ್ಷಕರು', 
        'ಹುಡುಗರು', 'ಹುಡುಗಿಯರು', 'ಪ್ರಾಣಿಗಳು', 'ಪಕ್ಷಿಗಳು', 'ನಾಯಿಗಳು',
        'ತಂದೆಗಳು', 'ತಾಯಿಗಳು', 'ಶಿಷ್ಯರು', 'ಸ್ನೇಹಿತರು'
    ],
    
    // Neuter subjects (pronouns + animals/objects)
    neuter: [
        'ಅದು', 'ಇದು', 'ನಾಯಿ', 'ಬೆಕ್ಕು', 'ಪುಸ್ತಕ', 'ಮನೆ', 'ಮರವು', 'ಕುರ್ಚಿ', 
        'ಫೋನ್', 'ಶಾಲೆ', 'ಬಸ್', 'ಕಾರು', 'ಹೂವು', 'ನೀರು', 'ಬೆಳಕು'
    ],
    
    // First person pronouns
    firstPerson: ['ನಾನು', 'ನಾವು'],
    
    // Second person pronouns
    secondPerson: ['ನೀನು', 'ನೀವು']
};

// Verb ending map based on subject type
const VERB_ENDINGS = {
    masculine: 'ತ್ತಾನೆ',
    feminine: 'ತ್ತಾಳೆ',
    plural: 'ತ್ತಾರೆ',
    neuter: 'ತ್ತದೆ',
    firstPerson: 'ತ್ತೇನೆ',
    secondPersonSingular: 'ತ್ತಿಯೆ',
    secondPersonPlural: 'ತ್ತೀರಿ'
};

// Common verb endings to detect and replace
const VERB_ENDING_PATTERNS = [
    'ತ್ತೇನೆ', 'ತ್ತಾಳೆ', 'ತ್ತಾನೆ', 'ತ್ತೇವೆ', 'ತ್ತಾರೆ', 'ತ್ತದೆ', 
    'ತ್ತಿಯೆ', 'ತ್ತೀರಿ', 'ತ್ತಾಳೆ', 'ತ್ತಾರೆ'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Separate word from punctuation
function separatePunctuation(word) {
    const match = word.match(/^(.+?)([.,!?;:]*)$/);
    return match ? { word: match[1], punctuation: match[2] } : { word: word, punctuation: '' };
}

// Stem a Kannada word by removing common suffixes
function stemWord(word) {
    const suffixes = ['ನು', 'ನನ್ನು', 'ಳು', 'ಳನ್ನು', 'ರು', 'ರನ್ನು', 'ಗಳು', 'ಗಳನ್ನು', 
                     'ವು', 'ವನ್ನು', 'ಯು', 'ಯನ್ನು', 'ಗೆ', 'ಕೆ', 'ದಿಂದ', 'ನಿಂದ', 
                     'ಲ್ಲಿಂದ', 'ಗಳಿಂದ', 'ದಲ್ಲಿ', 'ನಲ್ಲಿ', 'ಗಳಲ್ಲಿ'];
    
    // Try removing suffixes in order of length (longest first)
    const sortedSuffixes = suffixes.sort((a, b) => b.length - a.length);
    
    for (const suffix of sortedSuffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length) {
            return word.slice(0, -suffix.length);
        }
    }
    
    return word;
}

// Check if word is a case marker (not a subject)
function isCaseMarker(word) {
    const caseEndings = ['ಗೆ', 'ಕೆ', 'ದಿಂದ', 'ನಿಂದ', 'ಲ್ಲಿಂದ', 'ಗಳಿಂದ', 
                        'ದಲ್ಲಿ', 'ನಲ್ಲಿ', 'ಗಳಲ್ಲಿ', 'ನೊಂದಿಗೆ', 'ರೊಂದಿಗೆ'];
    return caseEndings.some(ending => word.endsWith(ending));
}

// Detect subject type from word
function detectSubjectType(word) {
    const cleanWord = word.trim();
    const stemmedWord = stemWord(cleanWord);
    
    // Direct match
    if (KANNADA_DB.firstPerson.includes(cleanWord)) {
        return { type: 'firstPerson', word: cleanWord };
    }
    if (KANNADA_DB.secondPerson.includes(cleanWord)) {
        const isPlural = cleanWord === 'ನೀವು';
        return { type: isPlural ? 'secondPersonPlural' : 'secondPersonSingular', word: cleanWord };
    }
    if (KANNADA_DB.masculine.includes(cleanWord)) {
        return { type: 'masculine', word: cleanWord };
    }
    if (KANNADA_DB.feminine.includes(cleanWord)) {
        return { type: 'feminine', word: cleanWord };
    }
    if (KANNADA_DB.plural.includes(cleanWord)) {
        return { type: 'plural', word: cleanWord };
    }
    if (KANNADA_DB.neuter.includes(cleanWord)) {
        return { type: 'neuter', word: cleanWord };
    }
    
    // Stemmed match
    if (stemmedWord !== cleanWord) {
        if (KANNADA_DB.masculine.includes(stemmedWord)) {
            return { type: 'masculine', word: stemmedWord };
        }
        if (KANNADA_DB.feminine.includes(stemmedWord)) {
            return { type: 'feminine', word: stemmedWord };
        }
        if (KANNADA_DB.plural.includes(stemmedWord)) {
            return { type: 'plural', word: stemmedWord };
        }
        if (KANNADA_DB.neuter.includes(stemmedWord)) {
            return { type: 'neuter', word: stemmedWord };
        }
    }
    
    return null;
}

// Extract verb root from a verb word
function extractVerbRoot(verbWord) {
    // Remove common verb endings to get root
    for (const ending of VERB_ENDING_PATTERNS.sort((a, b) => b.length - a.length)) {
        if (verbWord.endsWith(ending) && verbWord.length > ending.length) {
            return verbWord.slice(0, -ending.length);
        }
    }
    
    // If no ending found, check if it ends with common verb root patterns
    if (verbWord.match(/[ತಡದಣಳ]$/)) {
        return verbWord;
    }
    
    return verbWord;
}

// Get correct verb ending based on subject type
function getVerbEnding(subjectType) {
    if (subjectType === 'secondPersonSingular') {
        return VERB_ENDINGS.secondPersonSingular;
    }
    if (subjectType === 'secondPersonPlural') {
        return VERB_ENDINGS.secondPersonPlural;
    }
    return VERB_ENDINGS[subjectType] || VERB_ENDINGS.masculine;
}

// ============================================================================
// MAIN GRAMMAR CORRECTION FUNCTION
// ============================================================================

function smartCorrect(text) {
    // Step 1: Normalize and tokenize
    let corrected = text.trim().replace(/\s+/g, ' ');
    const words = corrected.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) return corrected;
    
    // Step 2: Subject Detection - scan for subject (usually first few words)
    let subjectInfo = null;
    let subjectIndex = -1;
    
    // Scan first 5 words for subject (most subjects appear early)
    for (let i = 0; i < Math.min(5, words.length); i++) {
        const { word: cleanWord } = separatePunctuation(words[i]);
        
        // Skip case markers (not subjects)
        if (isCaseMarker(cleanWord)) {
            continue;
        }
        
        // Try to detect subject
        const detected = detectSubjectType(cleanWord);
        if (detected) {
            subjectInfo = detected;
            subjectIndex = i;
            break;
        }
    }
    
    // If no subject found in first 5 words, scan all words
    if (!subjectInfo) {
        for (let i = 0; i < words.length; i++) {
            const { word: cleanWord } = separatePunctuation(words[i]);
            
            if (isCaseMarker(cleanWord)) {
                continue;
            }
            
            const detected = detectSubjectType(cleanWord);
            if (detected) {
                subjectInfo = detected;
                subjectIndex = i;
                break;
            }
        }
    }
    
    // Step 3: Verb Correction
    if (subjectInfo) {
        const expectedEnding = getVerbEnding(subjectInfo.type);
        
        // Find verb (usually last word or before punctuation)
        let verbFound = false;
        
        // Scan from end backwards for verb
        for (let i = words.length - 1; i >= subjectIndex; i--) {
            const { word: verbWord, punctuation: verbPunct } = separatePunctuation(words[i]);
            
            // Check if this is a verb (has verb ending pattern)
            const hasVerbEnding = VERB_ENDING_PATTERNS.some(ending => verbWord.endsWith(ending));
            
            if (hasVerbEnding || verbWord.match(/[ತಡದಣಳ]$/)) {
                // Extract root
                const verbRoot = extractVerbRoot(verbWord);
                
                // Check if ending needs to be corrected
                const currentEnding = verbWord.endsWith(expectedEnding) ? null : 
                    VERB_ENDING_PATTERNS.find(ending => verbWord.endsWith(ending));
                
                if (currentEnding && currentEnding !== expectedEnding) {
                    // Replace wrong ending with correct one
                    const correctedVerb = verbRoot + expectedEnding;
                    words[i] = correctedVerb + verbPunct;
                    verbFound = true;
                    break;
                } else if (!hasVerbEnding && verbRoot.match(/[ತಡದಣಳ]$/)) {
                    // Add ending to verb root
                    const correctedVerb = verbRoot + expectedEnding;
                    words[i] = correctedVerb + verbPunct;
                    verbFound = true;
                    break;
                } else if (hasVerbEnding && verbWord.endsWith(expectedEnding)) {
                    // Already correct
                    verbFound = true;
                    break;
                }
            }
        }
        
        // If verb not found but we have a subject, try to add ending to last word
        if (!verbFound && words.length > subjectIndex + 1) {
            const lastWordIndex = words.length - 1;
            const { word: lastWord, punctuation: lastPunct } = separatePunctuation(words[lastWordIndex]);
            
            // If last word could be a verb root
            if (lastWord.match(/[ತಡದಣಳ]$/) && !isCaseMarker(lastWord)) {
                words[lastWordIndex] = lastWord + expectedEnding + lastPunct;
            }
        }
    }
    
    // Step 4: Join words with spaces
    corrected = words.join(' ');
    
    // Step 5: Basic SOV word order correction (optional enhancement)
    const sentenceEndMatch = corrected.match(/[.!?]$/);
    const sentenceEnd = sentenceEndMatch ? sentenceEndMatch[0] : '';
    let cleanText = corrected.replace(/[.!?]$/, '');
    const cleanWords = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    // Simple reordering if subject is at end and verb is earlier
    if (cleanWords.length > 2 && subjectInfo && subjectIndex >= 0) {
        const lastWordClean = separatePunctuation(cleanWords[cleanWords.length - 1]).word;
        const lastWordIsSubject = detectSubjectType(lastWordClean);
        
        if (lastWordIsSubject && subjectIndex < cleanWords.length - 2) {
            // Look for verb before last word
            for (let i = cleanWords.length - 2; i > subjectIndex; i--) {
                const { word: checkWord } = separatePunctuation(cleanWords[i]);
                if (VERB_ENDING_PATTERNS.some(ending => checkWord.endsWith(ending))) {
                    // Move verb to end
                    const verb = cleanWords[i];
                    cleanWords.splice(i, 1);
                    cleanWords.push(verb);
                    break;
                }
            }
        }
    }
    
    corrected = cleanWords.join(' ') + sentenceEnd;
    
    return corrected.trim();
}

// ============================================================================
// SPEECH RECOGNITION SETUP
// ============================================================================

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'kn-IN'; // Kannada (India)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        recordBtn.classList.add('active');
        recordBtn.querySelector('.record-text').textContent = 'Listening...';
        inputText.textContent = 'ಕೇಳುತ್ತಿದ್ದೇನೆ...';
        outputText.textContent = '';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputText.textContent = transcript;
        
        // Apply grammar correction
        const corrected = smartCorrect(transcript);
        displayCorrectedText(corrected);
        
        // Speak the corrected text
        speakText(corrected);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        inputText.textContent = 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
        recordBtn.classList.remove('active');
        recordBtn.querySelector('.record-text').textContent = 'Record';
        isRecording = false;
    };

    recognition.onend = () => {
        isRecording = false;
        recordBtn.classList.remove('active');
        recordBtn.querySelector('.record-text').textContent = 'Record';
    };
} else {
    recordBtn.disabled = true;
    inputText.textContent = 'ಈ ಬ್ರೌಸರ್ ಮಾತನಾಡುವ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.';
}

// Record Button Click Handler
recordBtn.addEventListener('click', () => {
    if (!recognition) return;
    
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

// ============================================================================
// DISPLAY CORRECTED TEXT WITH ANIMATION
// ============================================================================

function displayCorrectedText(corrected) {
    outputText.innerHTML = '';
    
    // Normalize whitespace first
    const normalizedText = corrected.trim().replace(/\s+/g, ' ');
    
    // Split text into words and spaces, preserving both
    const parts = normalizedText.split(/(\s+)/);
    
    parts.forEach((part, index) => {
        // Check if this is whitespace or a word
        if (/\s/.test(part)) {
            // This is whitespace - preserve it as text node
            outputText.appendChild(document.createTextNode(' '));
        } else if (part.trim().length > 0) {
            // This is a word
            const span = document.createElement('span');
            span.textContent = part;
            span.className = 'corrected-word';
            span.style.animationDelay = `${index * 0.1}s`;
            outputText.appendChild(span);
        }
    });
    
    // If no content was added, add the text directly
    if (outputText.childNodes.length === 0) {
        outputText.textContent = normalizedText;
    }
    
    // Remove animation class after animation completes to allow re-triggering
    setTimeout(() => {
        const correctedWords = outputText.querySelectorAll('.corrected-word');
        correctedWords.forEach(span => {
            span.style.animation = 'none';
            setTimeout(() => {
                span.style.animation = '';
            }, 10);
        });
    }, 1500);
}

// ============================================================================
// TEXT-TO-SPEECH FUNCTION
// ============================================================================

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'kn-IN'; // Kannada (India)
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a Kannada voice
    const voices = window.speechSynthesis.getVoices();
    const kannadaVoice = voices.find(voice => 
        voice.lang.startsWith('kn') || 
        voice.name.toLowerCase().includes('kannada') ||
        voice.name.toLowerCase().includes('indian')
    );
    
    if (kannadaVoice) {
        utterance.voice = kannadaVoice;
    }
    
    utterance.onstart = () => {
        console.log('Speaking corrected text...');
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
    };
    
    window.speechSynthesis.speak(utterance);
    
    // Load voices if not available immediately
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            const kannadaVoice = updatedVoices.find(voice => 
                voice.lang.startsWith('kn') || 
                voice.name.toLowerCase().includes('kannada') ||
                voice.name.toLowerCase().includes('indian')
            );
            if (kannadaVoice) {
                utterance.voice = kannadaVoice;
            }
            window.speechSynthesis.speak(utterance);
        };
    }
}

// Keyboard shortcut: Space bar to toggle recording
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        recordBtn.click();
    }
});
