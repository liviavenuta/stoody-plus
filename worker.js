/** Stoody+ API. Configure GEMINI_API_KEY as a Worker Secret. */
const ALLOWED_ORIGIN = "https://liviavenuta.github.io";
const MODEL = "gemini-3.8-flash";
const MAX_BODY_BYTES = 12000;
function cors(origin) { return { "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null", "Access-Control-Allow-Methods": "POST, OPTIONS, GET", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Vary": "Origin" }; }
function json(data, status, origin) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin), "Cache-Control": "no-store" } }); }
function trustedBrazilianUrl(raw) { try { const u = new URL(raw); if (u.protocol !== "https:") return false; const h = u.hostname.toLowerCase(); return h === "gov.br" || h.endsWith(".gov.br") || h === "planalto.gov.br" || h.endsWith(".planalto.gov.br") || h === "jus.br" || h.endsWith(".jus.br") || h.endsWith(".edu.br") || h === "scielo.br" || h.endsWith(".scielo.br") || h === "bvs.br" || h.endsWith(".bvs.br") || h.endsWith(".fiocruz.br") || h.endsWith(".ipea.gov.br") || h.endsWith(".ibict.br"); } catch { return false; } }
export default { async fetch(request, env) {
 const origin = request.headers.get("Origin") || "";
 if (request.method === "OPTIONS") { if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 }); return new Response(null, { status: 204, headers: cors(origin) }); }
 if (request.method === "GET" && new URL(request.url).pathname === "/") return json({ service: "Stoody+ API", status: "online" }, 200, origin);
 if (origin !== ALLOWED_ORIGIN) return json({ error: "Origem não autorizada." }, 403, origin);
 if (request.method !== "POST" || new URL(request.url).pathname !== "/explain") return json({ error: "Rota não encontrada." }, 404, origin);
 if (!env.GEMINI_API_KEY) return json({ error: "Segredo GEMINI_API_KEY não configurado." }, 503, origin);
 const declaredLength = Number(request.headers.get("Content-Length") || 0); if (declaredLength > MAX_BODY_BYTES) return json({ error: "Solicitação muito grande." }, 413, origin);
 let body; try { body = await request.json(); } catch { return json({ error: "JSON inválido." }, 400, origin); }
 const stem = String(body.stem || "").trim(); const answer = String(body.answer || "").trim().toUpperCase(); const subject = String(body.subject || "").trim().slice(0, 160); const topic = String(body.topic || "").trim().slice(0, 200); const options = body.options && typeof body.options === "object" ? body.options : {};
 const optionLines = Object.entries(options).slice(0, 8).map(([k, v]) => String(k).slice(0, 3) + ": " + String(v).slice(0, 1000));
 if (!stem || stem.length > 6000 || !answer || !(options[answer] || options[answer.toLowerCase()] || options[answer.toUpperCase()]) || optionLines.length < 2) return json({ error: "Dados da questão incompletos ou inválidos." }, 400, origin);
 const prompt = "Você é um professor brasileiro experiente que comenta questões de concursos.\n" +
 "Pesquise usando a ferramenta de busca e use SOMENTE fontes brasileiras confiáveis, preferindo legislação oficial (Planalto), órgãos públicos, tribunais, universidades e periódicos científicos brasileiros.\n" +
 "Não invente leis, artigos, decisões, autores, títulos, datas ou URLs. Não use blogs comerciais, fóruns ou sites de cursinhos como fonte principal.\n" +
 "Se o gabarito parecer incompatível com fontes confiáveis, informe possível divergência e não force justificativa.\n" +
 "Explique em português brasileiro: por que a alternativa indicada está correta; por que as demais estão incorretas quando demonstrável; e uma dica curta. Não invente referências: elas serão extraídas dos resultados reais da busca.\n" +
 "Se não houver base brasileira suficiente, responda exatamente: Não foi possível localizar fonte brasileira confiável suficiente para comentar esta questão com segurança.\n" +
 "Matéria: " + subject + "\nAssunto: " + (topic || "não informado") + "\nEnunciado: " + stem + "\nAlternativas:\n" + optionLines.join("\n") + "\nGabarito informado: " + answer;
 let upstream; try { upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + encodeURIComponent(env.GEMINI_API_KEY), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.2, maxOutputTokens: 1400 } }) }); } catch { return json({ error: "Não foi possível conectar ao serviço de IA." }, 502, origin); }
 const result = await upstream.json().catch(() => ({})); if (!upstream.ok) { const apiMessage = String(result.error && result.error.message || "Erro sem detalhes retornados pela API Gemini.").replace(/GEMINI_API_KEY|key=[^&\\s]+/gi, "[segredo oculto]").slice(0, 500); return json({ error: "Falha na API Gemini: " + apiMessage }, 502, origin); }
 const candidate = result.candidates && result.candidates[0]; const explanation = ((candidate && candidate.content && candidate.content.parts) || []).map(p => p.text || "").join("\n").trim();
 const chunks = candidate && candidate.groundingMetadata && candidate.groundingMetadata.groundingChunks || []; const references = []; const seen = new Set();
 for (const chunk of chunks) { const web = chunk.web; if (!web || !web.uri || !trustedBrazilianUrl(web.uri) || seen.has(web.uri)) continue; seen.add(web.uri); references.push({ label: String(web.title || new URL(web.uri).hostname).slice(0, 180), url: web.uri }); }
 if (!explanation || explanation.startsWith("Não foi possível localizar fonte brasileira confiável suficiente") || references.length === 0) return json({ error: "Não encontramos fontes brasileiras confiáveis suficientes para comentar esta questão com segurança.", explanation: null, references: [] }, 422, origin);
 return json({ explanation, references, model: MODEL, sourceStatus: "grounded_search" }, 200, origin);
} };