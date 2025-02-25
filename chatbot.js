// الإعدادات والمتغيرات العامة
const GEMINI_API_KEY = 'AIzaSyDs1fYzWNfE4K4PA_WCVFE4YaOmIyD9H9c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

let isAnalyzing = false;
let userAnswers = [];
let currentQuestionIndex = 0;

// قائمة الأسئلة المحددة مسبقاً مع خياراتها
const personalityQuestions = [
    {
        question: "كيف تفضل قضاء وقت فراغك؟",
        choices: [
            "أحب قضاء الوقت مع الأصدقاء والعائلة",
            "أفضل القراءة والأنشطة الفردية",
            "أمارس الرياضة وأنشطة خارجية"
        ]
    },
    {
        question: "كيف تتصرف في المواقف الضاغطة؟",
        choices: [
            "أحاول حل المشكلة بهدوء وتركيز",
            "أطلب المساعدة والنصيحة من الآخرين",
            "أحتاج لبعض الوقت للتفكير بمفردي"
        ]
    },
    {
        question: "كيف تتعامل مع التغيير في حياتك؟",
        choices: [
            "أتكيف بسرعة وأرى التغيير كفرصة",
            "أحتاج لوقت للتأقلم لكنني أتقبله",
            "أفضل الثبات والروتين المعتاد"
        ]
    },
    {
        question: "كيف تتخذ قراراتك المهمة؟",
        choices: [
            "أعتمد على المنطق والتحليل",
            "أستمع لمشاعري وحدسي",
            "أستشير الآخرين وأجمع الآراء"
        ]
    },
    {
        question: "كيف تتفاعل في المواقف الاجتماعية الجديدة؟",
        choices: [
            "أبادر بالتعرف على الآخرين",
            "أنتظر حتى يبادر الآخرون بالحديث معي",
            "أشعر بعدم الراحة وأفضل الابتعاد"
        ]
    }
];

// إضافة رسالة من البوت
function addBotMessage(message) {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    messageDiv.innerHTML = `<i class="fas fa-robot"></i> ${message}`;
    container.appendChild(messageDiv);
    container.appendChild(document.createElement('div')).className = 'clearfix';
    container.scrollTop = container.scrollHeight;
}

// إضافة رسالة من المستخدم
function addUserMessage(message) {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `<i class="fas fa-user"></i> ${message}`;
    container.appendChild(messageDiv);
    container.appendChild(document.createElement('div')).className = 'clearfix';
    container.scrollTop = container.scrollHeight;
}

// إضافة أزرار الاختيار
function addChoiceButtons(choices) {
    const container = document.getElementById('chatContainer');
    if (!container) return;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'choice-buttons';
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary choice-btn';
        button.innerHTML = `<i class="fas fa-circle"></i> ${choice}`;
        button.onclick = () => handleChoice(choice);
        buttonsContainer.appendChild(button);
    });
    
    container.appendChild(buttonsContainer);
    container.scrollTop = container.scrollHeight;
}

// معالجة اختيار المستخدم
function handleChoice(choice) {
    if (!isAnalyzing) {
        if (choice === "نعم، أنا مستعد") {
            addUserMessage(choice);
            askNextQuestion();
        } else {
            addUserMessage(choice);
            addBotMessage("حسناً، يمكنك العودة في أي وقت عندما تكون مستعداً!");
            isAnalyzing = false;
        }
        return;
    }

    // إضافة الإجابة للمصفوفة
    addUserMessage(choice);
    userAnswers.push(choice);
    
    // التحقق من اكتمال الأسئلة
    if (currentQuestionIndex < personalityQuestions.length - 1) {
        currentQuestionIndex++;
        setTimeout(askNextQuestion, 1000);
    } else {
        finishAnalysis();
    }
}

// طرح السؤال التالي
function askNextQuestion() {
    const question = personalityQuestions[currentQuestionIndex];
    addBotMessage(question.question);
    addChoiceButtons(question.choices);
}

// إنهاء التحليل وعرض النتائج
async function finishAnalysis() {
    addBotMessage("شكراً لإجاباتك! سأقوم الآن بتحليل شخصيتك...");
    
    try {
        console.log('User Answers:', userAnswers); // للتأكد من وجود الإجابات
        
        // تحليل الإجابات
        const analysis = analyzeAnswers(userAnswers);
        console.log('Analysis Results:', analysis); // للتأكد من نتائج التحليل
        
        // تحديث النتائج في الواجهة
        updateResults(analysis);
        
        // إظهار قسم النتائج
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
        
        // إضافة رسالة تأكيد
        addBotMessage("اكتمل التحليل! يمكنك الآن رؤية نتائج تحليل شخصيتك في الرسم البياني والمؤشرات أدناه.");
        
        // إعادة تعيين المتغيرات
        isAnalyzing = false;
        currentQuestionIndex = 0;
        userAnswers = [];
    } catch (error) {
        console.error('Error in analysis:', error);
        addBotMessage("عذراً، حدث خطأ أثناء تحليل الإجابات. يرجى المحاولة مرة أخرى.");
    }
}

// تحديث النتائج في الواجهة
function updateResults(analysis) {
    if (!analysis) {
        console.error('No analysis results provided');
        return;
    }
    
    try {
        updateChart(analysis);
        updateProgressBars(analysis);
    } catch (error) {
        console.error('Error updating results:', error);
    }
}

// تحليل الإجابات وتحديد السمات الشخصية
function analyzeAnswers(answers) {
    let traits = {
        openness: 50,      // الانفتاح على التجارب
        conscientiousness: 50, // الضمير والمسؤولية
        extraversion: 50,  // الانبساطية
        agreeableness: 50, // الطيبة والموافقة
        neuroticism: 50    // العصابية
    };

    // تحليل كل إجابة وتأثيرها على السمات الشخصية
    answers.forEach((answer, index) => {
        switch(index) {
            case 0: // كيف تفضل قضاء وقت فراغك؟
                if (answer.includes("الأصدقاء والعائلة")) {
                    traits.extraversion += 15;
                    traits.agreeableness += 10;
                } else if (answer.includes("القراءة")) {
                    traits.openness += 15;
                    traits.extraversion -= 5;
                } else if (answer.includes("الرياضة")) {
                    traits.conscientiousness += 15;
                    traits.extraversion += 10;
                }
                break;

            case 1: // كيف تتصرف في المواقف الضاغطة؟
                if (answer.includes("بهدوء وتركيز")) {
                    traits.conscientiousness += 15;
                    traits.neuroticism -= 10;
                } else if (answer.includes("أطلب المساعدة")) {
                    traits.agreeableness += 15;
                    traits.extraversion += 10;
                } else if (answer.includes("وقت للتفكير")) {
                    traits.openness += 10;
                    traits.neuroticism += 5;
                }
                break;

            case 2: // كيف تتعامل مع التغيير؟
                if (answer.includes("أتكيف بسرعة")) {
                    traits.openness += 15;
                    traits.neuroticism -= 10;
                } else if (answer.includes("أحتاج لوقت")) {
                    traits.conscientiousness += 10;
                    traits.neuroticism += 5;
                } else if (answer.includes("الثبات والروتين")) {
                    traits.conscientiousness += 15;
                    traits.openness -= 10;
                }
                break;

            case 3: // كيف تتخذ قراراتك المهمة؟
                if (answer.includes("المنطق والتحليل")) {
                    traits.conscientiousness += 15;
                    traits.neuroticism -= 5;
                } else if (answer.includes("مشاعري وحدسي")) {
                    traits.openness += 15;
                    traits.neuroticism += 5;
                } else if (answer.includes("أستشير الآخرين")) {
                    traits.agreeableness += 15;
                    traits.extraversion += 10;
                }
                break;

            case 4: // كيف تتفاعل في المواقف الاجتماعية؟
                if (answer.includes("أبادر")) {
                    traits.extraversion += 15;
                    traits.openness += 10;
                } else if (answer.includes("أنتظر")) {
                    traits.agreeableness += 10;
                    traits.extraversion -= 5;
                } else if (answer.includes("عدم الراحة")) {
                    traits.neuroticism += 15;
                    traits.extraversion -= 10;
                }
                break;
        }
    });

    // تأكد من أن جميع القيم بين 0 و 100
    Object.keys(traits).forEach(trait => {
        traits[trait] = Math.max(0, Math.min(100, traits[trait]));
    });

    return traits;
}

// تحديث الرسم البياني
function updateChart(traits) {
    const ctx = document.getElementById('personalityChart');
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }

    // تدمير الرسم البياني السابق إذا وجد
    if (window.personalityChart instanceof Chart) {
        window.personalityChart.destroy();
    }

    // إنشاء الرسم البياني الجديد
    window.personalityChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['الانفتاح على التجارب', 'الضمير والمسؤولية', 'الانبساطية', 'الطيبة والموافقة', 'العصابية'],
            datasets: [{
                label: 'سمات الشخصية',
                data: [
                    traits.openness,
                    traits.conscientiousness,
                    traits.extraversion,
                    traits.agreeableness,
                    traits.neuroticism
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// تحديث شرائط التقدم
function updateProgressBars(traits) {
    const container = document.getElementById('progressBarsContainer');
    if (!container) {
        console.error('Progress bars container not found');
        return;
    }

    const traitLabels = {
        openness: 'الانفتاح على التجارب',
        conscientiousness: 'الضمير والمسؤولية',
        extraversion: 'الانبساطية',
        agreeableness: 'الطيبة والموافقة',
        neuroticism: 'العصابية'
    };

    const traitIcons = {
        openness: 'book-open',
        conscientiousness: 'check-double',
        extraversion: 'users',
        agreeableness: 'heart',
        neuroticism: 'balance-scale'
    };

    const traitColors = {
        openness: 'primary',
        conscientiousness: 'success',
        extraversion: 'info',
        agreeableness: 'warning',
        neuroticism: 'danger'
    };

    let html = '';
    Object.entries(traits).forEach(([trait, value]) => {
        html += `
            <div class="trait mb-3">
                <label class="mb-2">
                    <i class="fas fa-${traitIcons[trait]} text-${traitColors[trait]}"></i>
                    ${traitLabels[trait]}
                </label>
                <div class="progress">
                    <div class="progress-bar bg-${traitColors[trait]}" 
                         role="progressbar" 
                         style="width: ${value}%" 
                         aria-valuenow="${value}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        ${Math.round(value)}%
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// بدء التحليل الشخصي
function startPersonalityAnalysis() {
    isAnalyzing = true;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // إخفاء نتائج التحليل السابق إن وجدت
    document.getElementById('resultsContainer').style.display = 'none';
    
    // مسح المحادثة السابقة
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.innerHTML = '';
    }
    
    addBotMessage("مرحباً! أنا مساعدك الشخصي لتحليل الشخصية. سأطرح عليك 5 أسئلة لفهم شخصيتك بشكل أفضل. هل أنت مستعد للبدء؟");
    addChoiceButtons(["نعم، أنا مستعد", "لا، في وقت لاحق"]);
}

// تصدير الدوال المطلوبة للاستخدام في الواجهة
window.startPersonalityAnalysis = startPersonalityAnalysis;
window.handleChoice = handleChoice;
