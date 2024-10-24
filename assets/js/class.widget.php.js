class WidgetInsightsJs extends CWidget {
    onInitialize() {
        super.onInitialize();
        this._analysisType = null;
        this._outputContainer = null;
        this._analyseBtn = null;
    }

    setContents(response) {
        if (!this._analysisType) {
            super.setContents(response);
            this._body.innerHTML = `
            <div class="options" style="text-align: center; margin-bottom: 20px;">
                <select id="analysisType">
                    <option value="Resumen">Resumen</option>
                    <option value="Perspectivas">Perspectivas</option>
                    <option value="Diagnostico">Diagnostico</option>
                    <option value="Comparacion">Comparacion</option>
                    <option value="Pronostico">Pronóstico</option>
                    <option value="¿Que harias tu?">¿Que harias tu?</option>
                </select>
                <button id="analyseBtn">Analizar</button>
            </div>
            <div id="dashboard-container" class="dashboard-grid" style="height: 300px;">
                <div id="outputContainer" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"></div>
            </div>
            `;

            this._analysisType = this._body.querySelector('#analysisType');
            this._outputContainer = this._body.querySelector('#outputContainer');
            this._analyseBtn = this._body.querySelector('#analyseBtn');

            this._loadHtml2Canvas().then(() => {
                this._analyseBtn.addEventListener('click', this._onAnalyseBtnClick.bind(this));
            }).catch(error => {
                console.error('Failed to load html2canvas:', error);
            });
        }
    }

    _loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                return resolve();
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    _getPromptForAnalysisType(analysisType) {
        const prompts = {
            'Resumen': "Esta imagen muestra un tablero de Zabbix. Concéntrese únicamente en los paneles dentro del tablero. NO INCLUYA el panel de AI Analyser en su análisis. Proporcione un breve resumen de lo que el tablero está mostrando, enfocándose en los puntos más críticos y relevantes. Los colores más claros en el mapa de calor indican un uso más alto, los colores más oscuros indican un uso más bajo. Siempre comience con 'Este tablero muestra...' y asegúrese de que el resumen capture las ideas clave sin entrar en demasiados detalles",
            'Perspectivas': "Esta imagen muestra un panel de control de Zabbix. Concéntrese únicamente en los paneles dentro del panel de control. NO INCLUYA el panel de AI Analyser en su análisis. Explique qué está mostrando la información y comparta cualquier insight que pueda extraer. Los colores más claros en el mapa de calor indican un uso más alto, los colores más oscuros indican un uso más bajo. Siempre comience con 'Este panel de control muestra...' y proporcione información detallada sobre la información presentada, destacando cualquier tendencia, patrón o anomalía que observe.",
            'Diagnostico': "Esta imagen muestra un panel de control de Zabbix. Centrémonos únicamente en los paneles dentro del panel de control. NO INCLUYA el panel de AI Analyser en su análisis. Analice los datos para detectar cualquier problema o preocupación potencial, destacando las correlaciones y cualquier punto crítico de preocupación. Los colores más claros en el mapa de calor indican un uso más alto, los colores más oscuros indican un uso más bajo. Siempre comience con 'Este panel de control muestra...' y proporcione un diagnóstico detallado de cualquier posible problema o ineficiencia indicada por los datos.",
            'Comparacion': "Esta imagen muestra un panel de control de Zabbix. Centrémonos únicamente en los paneles dentro del panel de control. NO INCLUYA el panel de AI Analyser en su análisis. Compare los datos de los diferentes paneles para destacar cualquier correlación, discrepancia o diferencia significativa. Los colores más claros en el mapa de calor indican un uso más alto, los colores más oscuros indican un uso más bajo. Siempre comience con 'Este panel de control muestra...' y proporcione un análisis comparativo, explicando cómo los datos de los diferentes paneles se relacionan entre sí.",
            'Pronostico': "Esta imagen muestra un panel de control de Zabbix. Centrémonos únicamente en los paneles dentro del panel de control. NO INCLUYA el panel de AI Analyser en su análisis. Basándose en los datos actuales, proporcione una previsión de las tendencias y patrones de uso futuros. Los colores más claros en el mapa de calor indican un uso más alto, los colores más oscuros indican un uso más bajo. Siempre comience con 'Este panel de control muestra...' y ofrezca información sobre cómo podrían verse los datos futuros, explicando la base de sus predicciones.",
            '¿Que harias tu?': "Esta imagen muestra un dashboard de Zabbix. Enfócate solo en los paneles dentro del dashboard. NO INCLUYAS el panel de AI Analyser en tu análisis. Basado en los datos mostrados, sugiere acciones proactivas que un administrador de sistemas debería tomar para prevenir problemas y optimizar el rendimiento. Los colores más claros en el mapa de calor indican un uso más alto, y los colores más oscuros, un uso más bajo. Comienza con 'Basado en este dashboard, las acciones proactivas recomendadas son:' y proporciona al menos 5 acciones específicas, explicando el razonamiento detrás de cada una y su impacto esperado.Luego, imagina que eres un consultor de optimización de sistemas. Desarrolla una estrategia de mejora continua a largo plazo basada en los datos mostrados, estableciendo un plan de 3 a 6 meses. Comienza con 'Para mejorar continuamente el sistema mostrado en este dashboard, recomiendo la siguiente estrategia:' y detalla objetivos específicos, métricas a seguir, y los cambios sugeridos en la infraestructura o procesos. Explica cómo cada parte de la estrategia se relaciona con los datos observados en el dashboard y cómo estas recomendaciones podrían mejorar el rendimiento en el futuro."

        };
        return prompts[analysisType];
    }

    async _onAnalyseBtnClick() {
        console.log("Analyse button clicked...");
        const analysisType = this._analysisType.value;
        console.log("Selected analysis type:", analysisType);
        this._outputContainer.innerHTML = 'Analizando..';

        try {
            console.log("Capturing the dashboard...");
            const canvas = await html2canvas(document.querySelector('main'));
            console.log("Canvas created:", canvas);
            const dataUrl = canvas.toDataURL('image/png');
            console.log("Data URL created");

            const base64Image = dataUrl.split(',')[1];
            const prompt = this._getPromptForAnalysisType(analysisType);

            console.log("Sending captured image to Gemini API...");
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/png",
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                })
            });

            const responseData = await response.json();
            console.log("Response from Gemini:", responseData);

            // Ajustado para manejar la estructura de respuesta de Gemini
            const responseContent = responseData.candidates[0].content.parts[0].text;
            this._outputContainer.innerHTML = `<div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">${responseContent}</div>`;
            console.log("Analysis result:", responseContent);

        } catch (error) {
            console.error('Error during analysis:', error);
            this._outputContainer.innerHTML = '<div style="border: 1px solid #f00; padding: 10px; border-radius: 5px; background-color: #fee;">An error occurred during analysis.</div>';
        }
    }
}

// Register the widget
addWidgetClass(WidgetInsightsJs);
