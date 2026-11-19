auth.js

// AFTERHOURS ACCOUNT SYSTEM

document.addEventListener("DOMContentLoaded", () => {
  if (typeof supabaseClient === "undefined") {
    console.error("Supabase is not connected. Check supabase-config.js");
    return;
  }

  const db = supabaseClient;

  // Account button
  const accountButton = document.createElement("button");
  accountButton.textContent = "👤 Account";
  accountButton.style.cssText = `
    position:fixed;right:22px;top:20px;z-index:9998;
    padding:12px 20px;border:1px solid #168cff;
    border-radius:12px;background:#09264a;color:white;
    cursor:pointer;font-weight:bold;
  `;
  document.body.appendChild(accountButton);

  // Account window
  const modal = document.createElement("div");
  modal.style.cssText = `
    display:none;position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,.85);align-items:center;
    justify-content:center;padding:20px;
  `;

  modal.innerHTML = `
    <div style="
      background:#091a31;color:white;padding:28px;
      border:1px solid #168cff;border-radius:18px;
      width:100%;max-width:390px;font-family:Arial;
      box-shadow:0 0 35px #087bff55;
    ">
      <button id="ahClose" style="
        float:right;background:none;border:0;
        color:white;font-size:23px;cursor:pointer;
      ">×</button>

      <h2 style="color:#45b7ff;margin-top:5px">AfterHours Account</h2>
      <p id="ahStatus" style="color:#a9c9e8">Sign in or create an account.</p>

      <input id="ahName" placeholder="Display name (for signup)" style="
        display:block;width:100%;box-sizing:border-box;
        padding:13px;margin:12px 0;background:#102b4b;
        border:1px solid #245b8c;border-radius:9px;color:white;
      ">

      <input id="ahEmail" type="email" placeholder="Email address" style="
        display:block;width:100%;box-sizing:border-box;
        padding:13px;margin:12px 0;background:#102b4b;
        border:1px solid #245b8c;border-radius:9px;color:white;
      ">

      <input id="ahPassword" type="password" placeholder="Password" style="
        display:block;width:100%;box-sizing:border-box;
        padding:13px;margin:12px 0;background:#102b4b;
        border:1px solid #245b8c;border-radius:9px;color:white;
      ">

      <button id="ahSignup" style="
        width:100%;padding:13px;margin-top:10px;
        background:#087bff;color:white;border:0;
        border-radius:9px;font-weight:bold;cursor:pointer;
      ">Create Account</button>

      <button id="ahLogin" style="
        width:100%;padding:13px;margin-top:10px;
        background:#12375e;color:white;border:1px solid #168cff;
        border-radius:9px;font-weight:bold;cursor:pointer;
      ">Log In</button>

      <button id="ahLogout" style="
        display:none;width:100%;padding:13px;margin-top:10px;
        background:#762c43;color:white;border:0;
        border-radius:9px;cursor:pointer;
      ">Log Out</button>
    </div>
  `;

  document.body.appendChild(modal);

  const $ = id => document.getElementById(id);
  const status = $("ahStatus");

  function showMessage(message) {
    status.textContent = message;
  }

  accountButton.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  $("ahClose").addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) modal.style.display = "none";
  });

  async function refreshAccount() {
    const { data: { user } } = await db.auth.getUser();

    if (user) {
      const { data: profile } = await db
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      const name =
        profile?.display_name ||
        user.user_metadata?.display_name ||
        user.email;

      accountButton.textContent = "👤 " + name;
      showMessage("Logged in as " + name);
      $("ahName").style.display = "none";
      $("ahSignup").style.display = "none";
      $("ahLogin").style.display = "none";
      $("ahLogout").style.display = "block";
    } else {
      accountButton.textContent = "👤 Account";
      showMessage("Sign in or create an account.");
      $("ahName").style.display = "block";
      $("ahSignup").style.display = "block";
      $("ahLogin").style.display = "block";
      $("ahLogout").style.display = "none";
    }
  }

  // Create account
  $("ahSignup").addEventListener("click", async () => {
    const name = $("ahName").value.trim();
    const email = $("ahEmail").value.trim();
    const password = $("ahPassword").value;

    if (!name || !email || password.length < 6) {
      showMessage("Enter a name, email, and password of at least 6 characters.");
      return;
    }

    showMessage("Creating your account...");

    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name }
      }
    });

    if (error) {
      showMessage(error.message);
      return;
    }

    if (data.session) {
      showMessage("Account created! Welcome to AfterHours.");
    } else {
      showMessage("Account created! Check your email to confirm your account before logging in.");
    }

    await refreshAccount();
  });

  // Log in
  $("ahLogin").addEventListener("click", async () => {
    const email = $("ahEmail").value.trim();
    const password = $("ahPassword").value;

    if (!email || !password) {
      showMessage("Enter your email and password.");
      return;
    }

    showMessage("Logging in...");

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage(error.message);
      return;
    }

    showMessage("Welcome back!");
    await refreshAccount();
  });

  // Log out
  $("ahLogout").addEventListener("click", async () => {
    const { error } = await db.auth.signOut();

    if (error) {
      showMessage(error.message);
      return;
    }

    $("ahPassword").value = "";
    showMessage("You have logged out.");
    await refreshAccount();
  });

  db.auth.onAuthStateChange(() => {
    refreshAccount();
  });

  refreshAccount();
});
