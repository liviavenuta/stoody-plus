# Stoody+

Aplicativo de estudos e preparação para concursos, em português e com interface responsiva para celular.

## Funcionalidades da primeira versão
- Entrada em modo visitante, sem cadastro.
- Matérias separadas, com questões extraídas dos cinco PDFs enviados.
- 1.200 questões importadas com alternativas e gabaritos reconhecidos nos documentos.
- Simulados por matéria com quantidade configurável (5, 10, 15, 20, 30 ou 50).
- Correção imediata, histórico de respostas e registro de erros.
- Criação de cadernos de erros.
- Painel com respondidas, acertos, erros, aproveitamento, métricas por matéria e meta diária.
- Persistência local no navegador/dispositivo.

## Limitações conhecidas
- O botão “Entrar com Google” é apenas uma indicação visual: a autenticação real exige credenciais OAuth e configuração de backend.
- O progresso de visitante fica no navegador atual; sincronização entre dispositivos exige autenticação e armazenamento remoto.
- Os PDFs enviados apresentam gabaritos, mas não incluem comentários explicativos de correção de forma consistente. O app não inventa justificativas.
- A marca foi representada por tipografia e ícone nesta primeira entrega; o arquivo de imagem original será integrado na etapa de refinamento visual.
- O histórico é local e as métricas refletem apenas respostas registradas neste dispositivo.

## Publicar como site/app instalável
O repositório contém uma aplicação web estática. Pode ser publicada pelo GitHub Pages habilitando Pages para a branch main e pasta raiz.
