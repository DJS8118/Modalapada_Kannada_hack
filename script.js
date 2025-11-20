const startRecordingButton = document.getElementById('startRecording');
const leftContainer = document.getElementById('leftContainer');
const rightContainer = document.getElementById('rightContainer');
const buttonText = document.getElementById('buttonText');

let currentTranscript = '';
let fullTranscript = ''; // For continuous speech accumulation

// Comprehensive Kannada Subjects Dictionary (with actual Kannada script)
const kannadaSubjects = {
    'FirstPersonSingular': ['ನಾನು', 'ನನಗೆ', 'ನನ್ನ', 'ನಾನನ್ನು'],
    'SecondPersonSingular': ['ನೀನು', 'ನಿನಗೆ', 'ನಿನ್ನ', 'ನೀನನ್ನು'],
    'ThirdPersonMasculine': ['ಅವನು', 'ಅವನ', 'ಅವನನ್ನು', 'ಇವನು', 'ಇವನ', 'ರಾಮ', 'ರಾಮನು', 'ರಾಮನನ್ನು', 'ಹುಡುಗ', 'ಹುಡುಗನು'],
    'ThirdPersonFeminine': ['ಅವಳು', 'ಅವಳ', 'ಅವಳನ್ನು', 'ಇವಳು', 'ಇವಳ', 'ಸೀತೆ', 'ಹುಡುಗಿ', 'ಹುಡುಗಿಯು'],
    'ThirdPersonPlural': ['ಅವರು', 'ಅವರ', 'ಅವರನ್ನು', 'ಇವರು', 'ಇವರ', 'ಮಕ್ಕಳು', 'ವಿದ್ಯಾರ್ಥಿಗಳು', 'ಜನರು'],
    'FirstPersonPlural': ['ನಾವು', 'ನಮಗೆ', 'ನಮ್ಮ', 'ನಮ್ಮನ್ನು'],
    'Neuter': ['ಅದು', 'ಇದು', 'ಮಗು', 'ನಾಯಿ', 'ಪುಸ್ತಕ', 'ಮನೆ', 'ಮಾರ']
};

// Common Kannada nouns with gender
const kannadaNouns = {
    'Masculine': ['ರಾಮ', 'ರಾಮನು', 'ಹುಡುಗ', 'ಹುಡುಗನು', 'ತಂದೆ', 'ಮಗ', 'ಸ್ನೇಹಿತ', 'ರಾಜ', 'ಶಿಕ್ಷಕ', 'ವೈದ್ಯ'],
    'Feminine': ['ಸೀತೆ', 'ಹುಡುಗಿ', 'ತಾಯಿ', 'ಮಗಳು', 'ಸ್ನೇಹಿತೆ', 'ರಾಣಿ', 'ಶಿಕ್ಷಕಿ', 'ಲಕ್ಷ್ಮಿ'],
    'Plural': ['ಮಕ್ಕಳು', 'ವಿದ್ಯಾರ್ಥಿಗಳು', 'ಶಿಕ್ಷಕರು', 'ಹುಡುಗರು', 'ಹುಡುಗಿಯರು'],
    'Neuter': ['ಮಗು', 'ನಾಯಿ', 'ಬೆಕ್ಕು', 'ಹಾಸು', 'ಪಕ್ಷಿ', 'ಮರ', 'ಮನೆ', 'ಪುಸ್ತಕ', 'ಶಾಲೆ', 'ಕೆಲಸ']
};

// Verb endings mapping (actual Kannada script)
const verbEndingsMap = {
    // Present tense endings
    'ತ್ತೇನೆ': 'FirstPersonSingular',      // ಹೋಗುತ್ತೇನೆ
    'ತ್ತೀಯ': 'SecondPersonSingular',       // ಹೋಗುತ್ತೀಯ
    'ತ್ತಾನೆ': 'ThirdPersonMasculine',      // ಹೋಗುತ್ತಾನೆ
    'ತ್ತಾಳೆ': 'ThirdPersonFeminine',       // ಹೋಗುತ್ತಾಳೆ
    'ತ್ತಾರೆ': 'ThirdPersonPlural',         // ಹೋಗುತ್ತಾರೆ
    'ತ್ತೇವೆ': 'FirstPersonPlural',         // ಹೋಗುತ್ತೇವೆ
    'ತ್ತದೆ': 'Neuter',                     // ಹೋಗುತ್ತದೆ
    // Alternative spellings
    'ತ್ತೀಯಾ': 'SecondPersonSingular',
    'ತ್ತಾರಿ': 'ThirdPersonPlural',
    'ತ್ತೇವಿ': 'FirstPersonPlural',
    // Past tense (for reference)
    'ತ್ತಿದ್ದೇನೆ': 'FirstPersonSingular',
    'ತ್ತಿದ್ದಾನೆ': 'ThirdPersonMasculine',
    'ತ್ತಿದ್ದಾಳೆ': 'ThirdPersonFeminine'
};

// Correct verb endings for each subject type
const correctVerbEndings = {
    'FirstPersonSingular': 'ತ್ತೇನೆ',
    'SecondPersonSingular': 'ತ್ತೀಯ',
    'ThirdPersonMasculine': 'ತ್ತಾನೆ',
    'ThirdPersonFeminine': 'ತ್ತಾಳೆ',
    'ThirdPersonPlural': 'ತ್ತಾರೆ',
    'FirstPersonPlural': 'ತ್ತೇವೆ',
    'Neuter': 'ತ್ತದೆ'
};

// POS Tag structure
function identifyPOS(word, sentence, wordIndex) {
    const trimmedWord = word.trim();
    
    // Check if it's a subject (pronoun or noun)
    for (const [subjectType, subjects] of Object.entries(kannadaSubjects)) {
        if (subjects.includes(trimmedWord)) {
            return { pos: 'SUBJECT', type: subjectType, word: trimmedWord };
        }
    }
    
    // Check if it's a noun
    for (const [gender, nouns] of Object.entries(kannadaNouns)) {
        if (nouns.includes(trimmedWord)) {
            return { pos: 'NOUN', type: gender, word: trimmedWord };
        }
    }
    
    // Check if it's a verb (typically last word in SOV structure)
    if (wordIndex === sentence.length - 1) {
        // Check if word ends with verb ending
        for (const [ending, subjectType] of Object.entries(verbEndingsMap)) {
            if (trimmedWord.endsWith(ending)) {
                return { pos: 'VERB', type: subjectType, word: trimmedWord, ending: ending };
            }
        }
        // If it's the last word and doesn't match any pattern, assume it's a verb
        return { pos: 'VERB', type: 'UNKNOWN', word: trimmedWord };
    }
    
    // Check for postpositions (ಗೆ, ನಿಂದ, ಇಂದ, ಅಲ್ಲಿ, etc.)
    if (trimmedWord.match(/[ಗೆನಿಂದಇಂದಅಲ್ಲಿ]$/)) {
        return { pos: 'POSTPOSITION', type: 'LOCATION', word: trimmedWord };
    }
    
    // Default: unknown
    return { pos: 'UNKNOWN', type: 'UNKNOWN', word: trimmedWord };
}

// Detect subject from sentence
function detectSubject(sentenceWords) {
    // Subject is typically first word in Kannada (SOV structure)
    for (let i = 0; i < sentenceWords.length; i++) {
        const wordInfo = identifyPOS(sentenceWords[i], sentenceWords, i);
        
        if (wordInfo.pos === 'SUBJECT') {
            return { index: i, type: wordInfo.type, word: wordInfo.word };
        }
        
        if (wordInfo.pos === 'NOUN' && i === 0) {
            // First noun might be the subject
            // Map noun gender to subject type
            const genderMap = {
                'Masculine': 'ThirdPersonMasculine',
                'Feminine': 'ThirdPersonFeminine',
                'Plural': 'ThirdPersonPlural',
                'Neuter': 'Neuter'
            };
            return { index: i, type: genderMap[wordInfo.type] || 'ThirdPersonMasculine', word: wordInfo.word };
        }
    }
    
    // Default: assume first person singular
    return { index: 0, type: 'FirstPersonSingular', word: sentenceWords[0] || 'ನಾನು' };
}

// Extract verb root
function extractVerbRoot(verb) {
    // Sort endings by length (longest first) to match longest ending first
    const endings = Object.keys(verbEndingsMap).sort((a, b) => b.length - a.length);
    
    for (const ending of endings) {
        if (verb.endsWith(ending)) {
            const root = verb.slice(0, -ending.length);
            return root;
        }
    }
    
    // If no ending found, try to extract common patterns
    // Kannada verbs often end with 'ು' or 'ುತ್ತ'
    if (verb.length > 4) {
        // Try removing last 4-5 characters as ending
        if (verb.endsWith('ತ್ತೇನೆ') || verb.endsWith('ತ್ತಾನೆ') || verb.endsWith('ತ್ತಾಳೆ')) {
            return verb.slice(0, -4);
        }
        if (verb.endsWith('ತ್ತಾರೆ') || verb.endsWith('ತ್ತೇವೆ') || verb.endsWith('ತ್ತದೆ')) {
            return verb.slice(0, -4);
        }
    }
    
    // If still no match, return verb as-is
    return verb;
}

// Detect verb and its current ending
function detectVerb(verb) {
    const endings = Object.keys(verbEndingsMap).sort((a, b) => b.length - a.length);
    
    for (const ending of endings) {
        if (verb.endsWith(ending)) {
            return {
                root: verb.slice(0, -ending.length),
                ending: ending,
                currentType: verbEndingsMap[ending]
            };
        }
    }
    
    return { root: verb, ending: null, currentType: null };
}

// Correct word order to SOV (Subject Object Verb)
function correctWordOrder(words) {
    const posTags = words.map((word, idx) => identifyPOS(word, words, idx));
    
    const subject = posTags.find(tag => tag.pos === 'SUBJECT' || (tag.pos === 'NOUN' && posTags.indexOf(tag) === 0));
    const verb = posTags[posTags.length - 1];
    const objects = posTags.filter(tag => tag.pos === 'NOUN' && posTags.indexOf(tag) > 0 && posTags.indexOf(tag) < posTags.length - 1);
    const postpositions = posTags.filter(tag => tag.pos === 'POSTPOSITION');
    
    // If verb is not at the end, move it to the end
    if (verb && verb.pos !== 'VERB') {
        // Find actual verb (usually last word)
        for (let i = words.length - 1; i >= 0; i--) {
            const tag = posTags[i];
            if (tag && (tag.word.endsWith('ತ್ತೇನೆ') || tag.word.endsWith('ತ್ತಾನೆ') || tag.word.endsWith('ತ್ತಾಳೆ') || 
                        tag.word.endsWith('ತ್ತಾರೆ') || tag.word.endsWith('ತ್ತೇವೆ') || tag.word.endsWith('ತ್ತದೆ'))) {
                // Verb found at position i, ensure it's at the end
                if (i !== words.length - 1) {
                    const verbWord = words[i];
                    words.splice(i, 1);
                    words.push(verbWord);
                }
                break;
            }
        }
    }
    
    // Basic SOV structure: Subject should be first
    // This is a simplified implementation - full parser would be more complex
    return words;
}

// Main correction function
function smartCorrect(sentence) {
    if (!sentence || sentence.trim().length === 0) {
        return { correctedText: sentence, correctionsMade: {} };
    }
    
    // Split into words
    const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) {
        return { correctedText: sentence, correctionsMade: {} };
    }
    
    console.log('Processing sentence:', words);
    
    // Step 1: Identify Subject, Object, Verb
    const subjectInfo = detectSubject(words);
    console.log('Detected subject:', subjectInfo);
    
    // Step 2: Detect verb (usually last word in SOV)
    const verbIndex = words.length - 1;
    const verbWord = words[verbIndex];
    const verbInfo = detectVerb(verbWord);
    console.log('Detected verb:', verbInfo);
    
    const correctionsMade = {};
    const correctedWords = [...words];
    
    // Step 3: Check subject-verb agreement
    const correctEnding = correctVerbEndings[subjectInfo.type];
    
    if (verbInfo.currentType !== subjectInfo.type && correctEnding) {
        // Verb doesn't match subject - correct it
        const verbRoot = verbInfo.root || extractVerbRoot(verbWord);
        const correctedVerb = verbRoot + correctEnding;
        
        if (correctedVerb !== verbWord) {
            correctedWords[verbIndex] = correctedVerb;
            correctionsMade[verbIndex] = true;
            console.log(`✓ Corrected: "${verbWord}" -> "${correctedVerb}" (Subject: ${subjectInfo.type})`);
        }
    }
    
    // Step 4: Correct word order (SOV)
    const reorderedWords = correctWordOrder(correctedWords);
    const finalWords = reorderedWords;
    
    // Check if reordering happened
    if (JSON.stringify(finalWords) !== JSON.stringify(correctedWords)) {
        // Mark that word order was changed
        console.log('Word order corrected');
    }
    
    return {
        correctedText: finalWords.join(' '),
        correctionsMade: correctionsMade
    };
}

// Handle multiple sentences in continuous speech
function processContinuousSpeech(text) {
    // Split by sentence endings (periods, exclamation, question marks in Kannada)
    // Kannada uses । and ॥ as sentence endings, but speech recognition might use periods
    const sentences = text.split(/[।॥\.\?\!]+/).filter(s => s.trim().length > 0);
    
    let allCorrected = [];
    let allCorrections = {};
    let wordOffset = 0;
    
    sentences.forEach(sentence => {
        const result = smartCorrect(sentence.trim());
        if (result.correctedText) {
            allCorrected.push(result.correctedText);
            
            // Update correction indices
            Object.keys(result.correctionsMade).forEach(idx => {
                allCorrections[wordOffset + parseInt(idx)] = true;
            });
            
            // Count words in original sentence
            wordOffset += sentence.trim().split(/\s+/).length;
        }
    });
    
    return {
        correctedText: allCorrected.join(' '),
        correctionsMade: allCorrections
    };
}

function addToLeft(content) {
    const leftBox = leftContainer.querySelector('.content-box');
    if (!leftBox) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.textContent = content;
    leftBox.appendChild(messageDiv);
    leftBox.scrollTop = leftBox.scrollHeight;
    
    const welcome = leftContainer.querySelector('.welcome-text');
    if (welcome) welcome.remove();
}

function addToRight(content, corrections = {}) {
    const rightBox = rightContainer.querySelector('.content-box');
    if (!rightBox) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    
    if (Object.keys(corrections).length > 0) {
        const words = content.split(' ');
        messageDiv.innerHTML = words.map((word, index) => {
            if (corrections[index]) {
                return `<span class="highlight-correction">${word}</span>`;
            }
            return word;
        }).join(' ');
    } else {
        messageDiv.textContent = content;
    }
    
    rightBox.appendChild(messageDiv);
    rightBox.scrollTop = rightBox.scrollHeight;
    
    const welcome = rightContainer.querySelector('.welcome-text');
    if (welcome) welcome.remove();
}

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    console.error('Speech recognition not supported');
    startRecordingButton.disabled = true;
}

const recognition = new SpeechRecognition();
recognition.lang = 'kn-IN';
recognition.continuous = true; // Enable continuous for 3+ minute speech
    recognition.interimResults = false;

// Circular button cursor tracking
let buttonTransform = { x: 0, y: 0 };
let targetTransform = { x: 0, y: 0 };

function updateButtonPosition() {
    buttonTransform.x += (targetTransform.x - buttonTransform.x) * 0.15;
    buttonTransform.y += (targetTransform.y - buttonTransform.y) * 0.15;
    
    if (startRecordingButton && !startRecordingButton.classList.contains('active')) {
        startRecordingButton.style.transform = `translate(${buttonTransform.x}px, ${buttonTransform.y}px)`;
    }
    
    requestAnimationFrame(updateButtonPosition);
}

document.addEventListener('mousemove', (e) => {
    if (startRecordingButton && !startRecordingButton.classList.contains('active')) {
        const rect = startRecordingButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 + buttonTransform.x;
        const centerY = rect.top + rect.height / 2 + buttonTransform.y;
        
        const deltaX = (e.clientX - centerX) / 40;
        const deltaY = (e.clientY - centerY) / 40;
        
        targetTransform.x = deltaX;
        targetTransform.y = deltaY;
    }
});

updateButtonPosition();

startRecordingButton.addEventListener('click', () => {
    if (startRecordingButton.classList.contains('active')) {
        // Stop recording
        recognition.stop();
        buttonText.textContent = 'Start Recording';
        startRecordingButton.disabled = false;
        startRecordingButton.classList.remove('active');
        fullTranscript = '';
        currentTranscript = '';
        targetTransform.x = 0;
        targetTransform.y = 0;
    } else {
        // Start recording
        buttonText.textContent = 'Stop Recording';
        startRecordingButton.disabled = false;
        startRecordingButton.classList.add('active');
        fullTranscript = '';
        currentTranscript = '';
        recognition.start();
    }
});

recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }
    
    // Accumulate final transcript
    if (finalTranscript.trim()) {
        fullTranscript += finalTranscript;
        currentTranscript = fullTranscript.trim();
        
        console.log('Final transcript:', currentTranscript);
        
        // Process and correct
        const result = processContinuousSpeech(currentTranscript);
        
        // Update displays
        addToLeft(currentTranscript);
        addToRight(result.correctedText, result.correctionsMade);
        
        // Audio feedback (only for latest correction)
        if (finalTranscript.trim()) {
            const utterance = new SpeechSynthesisUtterance(result.correctedText);
            utterance.lang = 'kn-IN';
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Show interim results in left panel
    if (interimTranscript && !finalTranscript) {
        const leftBox = leftContainer.querySelector('.content-box');
        if (leftBox) {
            const lastItem = leftBox.querySelector('.message-item:last-child');
            if (lastItem) {
                lastItem.textContent = currentTranscript + ' ' + interimTranscript;
            }
        }
    }
};

recognition.onend = () => {
    if (startRecordingButton.classList.contains('active')) {
        // Auto-restart if still in recording mode
        setTimeout(() => {
            if (startRecordingButton.classList.contains('active')) {
                recognition.start();
            }
        }, 100);
    } else {
        buttonText.textContent = 'Start Recording';
        targetTransform.x = 0;
        targetTransform.y = 0;
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') {
        // Auto-restart if no speech detected
        if (startRecordingButton.classList.contains('active')) {
            setTimeout(() => recognition.start(), 500);
        }
    } else {
        buttonText.textContent = 'Start Recording';
        startRecordingButton.disabled = false;
        startRecordingButton.classList.remove('active');
        targetTransform.x = 0;
        targetTransform.y = 0;
    }
};
