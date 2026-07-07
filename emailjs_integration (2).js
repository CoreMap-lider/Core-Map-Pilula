// emailjs_integration.js
// Envia lead para Formspree + Google Sheets (backup cross-device) + redireciona para laudo
function enviarLaudoPorEmail(email, nome, perfil) {
  return new Promise(function(resolve) {
    var scores = { C: 0, O: 0, R: 0, E: 0 };
    document.querySelectorAll('.bar-row').forEach(function(row) {
      var letra = row.querySelector('.bl').textContent.trim();
      var pts = row.querySelector('.bn').textContent.replace(' pts', '').trim();
      if (scores.hasOwnProperty(letra)) {
        scores[letra] = parseInt(pts) || 0;
      }
    });

    // Envio 1: Formspree (lead, como já era)
    var envioFormspree = fetch('https://formspree.io/f/xdavnaje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        email: email,
        perfil_predominante: perfil,
        pontuacao_C: scores.C,
        pontuacao_O: scores.O,
        pontuacao_R: scores.R,
        pontuacao_E: scores.E
      })
    });

    // Envio 2: Google Sheets (backup para acesso cross-device)
    var pontuacoesTexto = 'C:' + scores.C + ',O:' + scores.O + ',R:' + scores.R + ',E:' + scores.E;
    var formData = new URLSearchParams();
    formData.append('entry.1555809122', email);
    formData.append('entry.1801200075', pontuacoesTexto);

    var envioSheets = fetch('https://docs.google.com/forms/d/e/1FAIpQLScznCZFIYlS_jS3RC8ApnFcQhD__P-DhFTRwFEqKFsbn-5Cog/formResponse', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    Promise.allSettled([envioFormspree, envioSheets]).finally(function() {
      var params = new URLSearchParams({
        C: scores.C,
        O: scores.O,
        R: scores.R,
        E: scores.E,
        nome: nome || 'Lider'
      });
      try {
        localStorage.setItem('coremap_scores', JSON.stringify({
          C: scores.C, O: scores.O, R: scores.R, E: scores.E, nome: nome || 'Lider'
        }));
      } catch(e) {}
      window.location.href = 'pilula-v3.html?' + params.toString();
      resolve({ sucesso: true });
    });
  });
}
