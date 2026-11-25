(function(){
  function installEmailForm(){
    const card=document.querySelector(".welcome-card");
    if(!card||card.querySelector("#stoody-email-login"))return;
    const wrap=document.createElement("section");
    wrap.id="stoody-email-login";
    wrap.style.cssText="margin-top:18px;text-align:left";
    wrap.innerHTML='<div style="text-align:center;color:#8995ad;font-size:12px;font-weight:800;margin:14px 0">OU USE SEU E-MAIL</div><input id="stoody-email" type="email" autocomplete="email" placeholder="Seu e-mail" style="width:100%;box-sizing:border-box;padding:13px;border:1px solid #e2e8f5;border-radius:11px;margin:6px 0"><input id="stoody-password" type="password" autocomplete="current-password" placeholder="Senha (mínimo 6 caracteres)" style="width:100%;box-sizing:border-box;padding:13px;border:1px solid #e2e8f5;border-radius:11px;margin:6px 0"><button id="stoody-email-enter" class="primary full" style="width:100%;margin-top:8px">Entrar com e-mail</button><button id="stoody-email-create" class="outline full" style="width:100%;margin-top:8px">Criar conta com e-mail</button><p id="stoody-email-error" role="alert" style="display:none;color:#b42318;font-size:12px;overflow-wrap:anywhere"></p>';
    const google=card.querySelector(".google");
    if(google)google.insertAdjacentElement("afterend",wrap);else card.appendChild(wrap);
    const error=wrap.querySelector("#stoody-email-error");
    async function auth(mode){
      error.style.display="none";
      const email=wrap.querySelector("#stoody-email").value.trim();
      const password=wrap.querySelector("#stoody-password").value;
      if(!email||!password){error.textContent="Informe seu e-mail e sua senha.";error.style.display="block";return}
      if(password.length<6){error.textContent="A senha precisa ter pelo menos 6 caracteres.";error.style.display="block";return}
      if(!window.firebase||!firebase.auth){error.textContent="O Firebase não carregou. Atualize a página e tente novamente.";error.style.display="block";return}
      const enter=wrap.querySelector("#stoody-email-enter"),create=wrap.querySelector("#stoody-email-create");
      enter.disabled=create.disabled=true;
      try{
        if(mode==="create")await firebase.auth().createUserWithEmailAndPassword(email,password);
        else await firebase.auth().signInWithEmailAndPassword(email,password);
      }catch(e){
        const messages={
          "auth/email-already-in-use":"Este e-mail já tem cadastro. Use Entrar.",
          "auth/invalid-email":"O endereço de e-mail é inválido.",
          "auth/weak-password":"A senha precisa ter pelo menos 6 caracteres.",
          "auth/user-not-found":"Não existe conta com este e-mail. Escolha Criar conta.",
          "auth/wrong-password":"Senha incorreta. Confira e tente novamente.",
          "auth/invalid-credential":"E-mail ou senha incorretos.",
          "auth/operation-not-allowed":"O cadastro por e-mail e senha não está ativado no Firebase.",
          "auth/too-many-requests":"Muitas tentativas. Aguarde um pouco e tente novamente.",
          "auth/network-request-failed":"Falha de conexão. Verifique sua internet."
        };
        error.textContent=(messages[e.code]||e.message||"Não foi possível entrar.")+" ["+(e.code||"erro")+"]";
        error.style.display="block";
      }finally{enter.disabled=create.disabled=false}
    }
    wrap.querySelector("#stoody-email-enter").addEventListener("click",()=>auth("login"));
    wrap.querySelector("#stoody-email-create").addEventListener("click",()=>auth("create"));
  }
  const observer=new MutationObserver(installEmailForm);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  installEmailForm();
})();