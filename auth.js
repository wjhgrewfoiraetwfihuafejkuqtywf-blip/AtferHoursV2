auth.js


document.addEventListener("DOMContentLoaded", () => {
  const client = window.supabaseClient || window.supabase;

  if (!client || !client.auth) {
    console.error("Supabase is not connected. Check supabase-config.js");
    return;
  }

  const oldButton = document.getElementById("accountBtn");
  if (oldButton) oldButton.remove();

  const style = document.createElement("style");
  style.textContent = `
    .ah-auth-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,.8);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }
    .ah-auth-box {
      background: #101b35; color: white; padding: 28px;
      border: 1px solid #258cff; border-radius: 18px;
      width: 100%; max-width: 390px;
      font-family: Arial, sans-serif;
    }
    .ah-auth-box h2 { color: #42baff; }
    .ah-auth-box input {
      box-sizing: border-box; width: 100%; padding: 12px;
      margin: 8px 0; border-radius: 8px;
      border: 1px solid #345477; background: #071226;
      color: white;
    }
    .ah-auth-box button {
      padding: 12px; margin: 5px 3px; border: 0;
      border-radius: 8px; cursor: pointer;
      background: #168cff; color: white; font-weight: bold;
    }
    .ah-auth-box .secondary { background: #263b5c; }
    #ahAuthMessage { color: #8ed2ff; overflow-wrap: anywhere; }
  `;
  document.head.appendChild(style);

  const button = document.createElement("button");
  button.textContent = "Account / Login";
  button.style.cssText =
    "position:fixed;right:20px;top:20px;z-index:9999;padding:11px 17px;border:0;border-radius:9px;background:#168cff;color:white;font-weight:bold;cursor:pointer";
  document.body.appendChild(button);

  let overlay;

  function showLogin() {
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.className = "ah-auth-overlay";
    overlay.innerHTML = `
      <div class="ah-auth-box">
        <h2>AfterHours Account</h2>
        <p>Sign in or create your account.</p>
        <input id="ahEmail" type="email" placeholder="Email address" autocomplete="email">
        <input id="ahPassword" type="password" placeholder="Password (at least 6 characters)" autocomplete="current-password">
        <input id="ahName" type="text" placeholder="Display name (for signup)">
        <div>
          <button id="ahSignup">Create account</button>
          <button id="ahLogin">Log in</button>
        </div>
        <button id="ahLogout" class="secondary" style="display:none">Log out</button>
        <button id="ahClose" class="secondary">Close</button>
        <p id="ahAuthMessage"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const message = overlay.querySelector("#ahAuthMessage");
    const email = overlay.querySelector("#ahEmail");
    const password = overlay.querySelector("#ahPassword");
    const name = overlay.querySelector("#ahName");
    const signup = overlay.querySelector("#ahSignup");
    const login = overlay.querySelector("#ahLogin");
    const logout = overlay.querySelector("#ahLogout");

    overlay.querySelector("#ahClose").onclick = () => overlay.remove();

    signup.onclick = async () => {
      if (!email.value || password.value.length < 6) {
        message.textContent = "Enter an email and a password with at least 6 characters.";
        return;
      }

      message.textContent = "Creating account...";

      const { data, error } = await client.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
          data: { display_name: name.value.trim() || "Player" }
        }
      });

      message.textContent = error
        ? error.message
        : data.session
          ? "Account created! You're logged in."
          : "Account created! Check your email to confirm it.";
    };

    login.onclick = async () => {
      message.textContent = "Logging in...";
      const { error } = await client.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      });
      message.textContent = error ? error.message : "You're logged in!";
    };

    logout.onclick = async () => {
      const { error } = await client.auth.signOut();
      message.textContent = error ? error.message : "Logged out.";
      logout.style.display = "none";
    };

    (async () => {
      const { data } = await client.auth.getSession();
      if (data.session) {
        message.textContent = "Logged in as " + data.session.user.email;
        logout.style.display = "inline-block";
      }
    })();
  }

  button.onclick = showLogin;
});

