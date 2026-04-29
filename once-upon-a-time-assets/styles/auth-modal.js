// Auth modal — self-injecting markup + open/close + login/signup switch + password toggle.
// Just include this script + the matching CSS, and use any element with data-open-signin / data-open-signup.
(function () {
  const MARKUP = `
<div class="auth-overlay" id="auth-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="auth-title">
  <div class="auth-modal">
    <div class="auth-modal__art" aria-hidden="true"></div>
    <div class="auth-modal__panel">
      <div class="auth-modal__topbar">
        <button type="button" class="auth-back" aria-label="Back"><i class="ph ph-arrow-left" aria-hidden="true"></i> Back</button>
        <button type="button" class="auth-close" data-close-auth aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button>
      </div>
      <h2 class="auth-modal__title" id="auth-title">Log in</h2>
      <p class="auth-modal__lede" data-auth-lede>Please log in to continue</p>
      <fieldset class="role-toggle">
        <legend class="sr-only">I am signing in as</legend>
        <label><input type="radio" name="auth-role" value="student" checked> <span data-auth-role-student>Log in as a Student/Parent</span></label>
        <label><input type="radio" name="auth-role" value="donor"> <span data-auth-role-donor>Log in as a Donor</span></label>
      </fieldset>
      <form class="auth-form" novalidate>
        <div class="form-row" data-only="signup" hidden>
          <label class="field"><span class="field__label">First name</span><input class="input" type="text" placeholder="First name" autocomplete="given-name"></label>
          <label class="field"><span class="field__label">Last name</span><input class="input" type="text" placeholder="Last name" autocomplete="family-name"></label>
        </div>
        <label class="field"><span class="field__label">Email</span><input class="input" type="email" placeholder="username@gmail.com" autocomplete="email" required></label>
        <label class="field">
          <span class="field__label">Password</span>
          <span class="pw-wrap">
            <input class="input" type="password" placeholder="Password" autocomplete="current-password" required>
            <button type="button" class="pw-toggle" aria-label="Show password" data-pw-toggle><i class="ph ph-eye-slash" aria-hidden="true"></i></button>
          </span>
        </label>
        <div class="auth-form__row">
          <label><input type="checkbox"> Remember me</label>
          <span data-only="login">Forgot Password? <a href="#" class="link">Click Here</a></span>
        </div>
        <div class="auth-form__submit"><button class="btn" type="submit" data-auth-submit>Log in</button></div>
      </form>
      <div class="auth-divider"><span>Or <span data-auth-verb>log in</span> with</span></div>
      <div class="social-row">
        <button type="button" class="social-btn"><i class="ph ph-google-logo"></i> Google</button>
        <button type="button" class="social-btn"><i class="ph ph-apple-logo"></i> Apple</button>
        <button type="button" class="social-btn"><i class="ph ph-envelope"></i> Email</button>
      </div>
      <div class="auth-modal__footer">
        <span data-only="login">Don't have an account? <a href="#" data-switch-auth="signup">Sign Up Now</a></span>
        <span data-only="signup" hidden>Already have an account? <a href="#" data-switch-auth="login">Log in</a></span>
      </div>
    </div>
  </div>
</div>`;

  function init() {
    if (document.getElementById('auth-overlay')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = MARKUP;
    document.body.appendChild(wrapper.firstElementChild);
    wire();
  }

  function wire() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    const titleEl  = overlay.querySelector('#auth-title');
    const ledeEl   = overlay.querySelector('[data-auth-lede]');
    const submitBt = overlay.querySelector('[data-auth-submit]');
    const verbEl   = overlay.querySelector('[data-auth-verb]');
    const roleStu  = overlay.querySelector('[data-auth-role-student]');
    const roleDon  = overlay.querySelector('[data-auth-role-donor]');
    let lastFocus = null;

    function setMode(mode) {
      const isSignup = mode === 'signup';
      titleEl.textContent  = isSignup ? 'Sign up' : 'Log in';
      ledeEl.textContent   = isSignup ? 'Create an account to continue' : 'Please log in to continue';
      submitBt.textContent = isSignup ? 'Sign up' : 'Log in';
      verbEl.textContent   = isSignup ? 'Sign up' : 'log in';
      roleStu.textContent  = isSignup ? 'Sign up as a Student/Parent' : 'Log in as a Student/Parent';
      roleDon.textContent  = isSignup ? 'Sign up as a Donor' : 'Log in as a Donor';
      overlay.querySelectorAll('[data-only="login"]').forEach(el => el.hidden = isSignup);
      overlay.querySelectorAll('[data-only="signup"]').forEach(el => el.hidden = !isSignup);
    }
    function open(mode) {
      lastFocus = document.activeElement;
      setMode(mode || 'login');
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      const firstField = overlay.querySelector('input, button');
      if (firstField) firstField.focus();
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', e => {
      const open1 = e.target.closest('[data-open-signin]');
      const open2 = e.target.closest('[data-open-signup]');
      const closer = e.target.closest('[data-close-auth]');
      const switcher = e.target.closest('[data-switch-auth]');
      const pwBtn = e.target.closest('[data-pw-toggle]');
      if (open1) { e.preventDefault(); open('login'); return; }
      if (open2) { e.preventDefault(); open('signup'); return; }
      if (closer) { e.preventDefault(); close(); return; }
      if (switcher) { e.preventDefault(); setMode(switcher.dataset.switchAuth); return; }
      if (pwBtn) {
        e.preventDefault();
        const input = pwBtn.parentElement.querySelector('input');
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        pwBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        pwBtn.querySelector('i').className = showing ? 'ph ph-eye-slash' : 'ph ph-eye';
        return;
      }
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) close(); });
    overlay.querySelector('form').addEventListener('submit', e => e.preventDefault());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
