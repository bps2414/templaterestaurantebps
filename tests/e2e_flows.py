"""
E2E Flows — Multi-theme Playwright Tests
=========================================
Usage:
    # Single theme (default: restaurante)
    python tests/e2e_flows.py

    # Specific theme credentials
    python tests/e2e_flows.py --url http://localhost:3000 --admin-email admin@pizzaria.com

    # All lite themes in sequence (requires server to be running for each)
    python tests/e2e_flows.py --theme restaurant-lite
    python tests/e2e_flows.py --theme burger-lite
    python tests/e2e_flows.py --theme pizza-lite
    python tests/e2e_flows.py --theme acai
"""

import sys
import json
import time
import argparse
from playwright.sync_api import sync_playwright, Page

# ─── Theme configurations ─────────────────────────────────────────────────────
THEME_CONFIGS = {
    "restaurante": {"admin_email": "admin@restaurante.com", "is_starter": False},
    "hamburgueria": {"admin_email": "admin@hamburgueria.com", "is_starter": False},
    "pizzaria": {"admin_email": "admin@pizzaria.com", "is_starter": False},
    "confeitaria": {"admin_email": "admin@confeitaria.com", "is_starter": False},
    "restaurant-lite": {"admin_email": "admin@restaurante.com", "is_starter": True},
    "burger-lite": {"admin_email": "admin@lanchonete.com", "is_starter": True},
    "pizza-lite": {"admin_email": "admin@pizzaria.com", "is_starter": True},
    "acai": {"admin_email": "admin@acai.com", "is_starter": True},
}

ADMIN_PASSWORD = "admin123"


# ─── Step helpers ──────────────────────────────────────────────────────────────


def step_ok(steps: list, name: str, details: str = "") -> None:
    entry = {"step": name, "status": "success"}
    if details:
        entry["details"] = details
    steps.append(entry)


def step_fail(steps: list, name: str, details: str = "") -> None:
    entry = {"step": name, "status": "failed"}
    if details:
        entry["details"] = details
    steps.append(entry)


def step_warn(steps: list, name: str, details: str = "") -> None:
    entry = {"step": name, "status": "warning"}
    if details:
        entry["details"] = details
    steps.append(entry)


# ─── Client Flow ───────────────────────────────────────────────────────────────


def run_client_flow(page: Page, base_url: str, is_starter: bool) -> dict:
    steps = []
    try:
        # 1. Home loads
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        step_ok(steps, "Home Load")

        # 2. Menu link or text present
        if (
            page.locator("text=Cardápio").count() > 0
            or page.locator("a[href*='menu']").count() > 0
        ):
            step_ok(steps, "Menu Navigation Link")
        else:
            step_warn(
                steps, "Menu Navigation Link", "No 'Cardápio' text or menu link found"
            )

        # 3. No buy.html links (Stripe removed)
        buy_count = page.locator("a[href*='buy.html']").count()
        if buy_count == 0:
            step_ok(steps, "Stripe Removal Verified", "No buy.html links found")
        else:
            step_fail(
                steps, "Stripe Removal Verified", f"Found {buy_count} buy.html link(s)"
            )

        # 4. Menu page loads
        page.goto(f"{base_url}/menu.html")
        page.wait_for_load_state("networkidle")
        step_ok(steps, "Menu Page Load")

        # 5. Contact page loads
        page.goto(f"{base_url}/contact.html")
        page.wait_for_load_state("networkidle")
        step_ok(steps, "Contact Page Load")

        # 6. Starter: gallery tab should be absent from navigation
        if is_starter:
            gallery_links = page.locator("a[href*='gallery']").count()
            if gallery_links == 0:
                step_ok(
                    steps, "Starter Gallery Hidden", "No gallery links in public pages"
                )
            else:
                step_warn(
                    steps,
                    "Starter Gallery Hidden",
                    f"Found {gallery_links} gallery link(s) — starter should hide this",
                )

        return {"status": "success", "steps": steps}

    except Exception as e:
        step_fail(steps, "Client Flow Crash", str(e))
        return {"status": "failed", "steps": steps, "error": str(e)}


# ─── Admin Flow ────────────────────────────────────────────────────────────────


def run_admin_flow(page: Page, base_url: str, admin_email: str) -> dict:
    steps = []
    try:
        page.on("console", lambda msg: None)  # suppress noise

        # 1. /admin redirects to login or shows login form
        start = time.time()
        page.goto(f"{base_url}/admin.html")
        page.wait_for_load_state("networkidle")
        elapsed = time.time() - start
        step_ok(steps, "Admin Page Load", f"{elapsed:.2f}s")

        has_login = (
            "login" in page.url
            or page.locator("input[type='password']").count() > 0
            or page.locator("#login-email, input[name='email']").count() > 0
        )

        if not has_login:
            step_warn(
                steps,
                "Admin Login Form",
                "Login form not detected — may already be logged in or SPA has different mount point",
            )
            return {"status": "success", "steps": steps}

        step_ok(steps, "Admin Login Form Found")

        # 2. Fill credentials and submit
        email_sel = "#login-email, input[type='email']"
        pass_sel = "#login-password, input[type='password']"
        btn_sel = "#login-btn, button[type='submit']"

        page.fill(email_sel, admin_email)
        page.fill(pass_sel, ADMIN_PASSWORD)
        page.click(btn_sel)

        # 3. Wait for dashboard or error
        try:
            page.wait_for_selector(
                "#admin-dashboard, [data-view='dashboard'], .admin-dashboard",
                state="visible",
                timeout=6000,
            )
            step_ok(steps, "Admin Login Success")
        except Exception:
            error_visible = page.locator(
                "#login-error, .login-error, [data-error]"
            ).is_visible()
            if error_visible:
                err_text = (
                    page.locator("#login-error, .login-error").text_content()
                    or "error element visible"
                )
                step_fail(steps, "Admin Login", f"Login error shown: {err_text}")
            else:
                step_warn(
                    steps,
                    "Admin Login",
                    f"Dashboard not found after login — URL: {page.url}",
                )

        # 4. Dashboard has category/dish sections
        has_sections = (
            page.locator("text=Categorias, text=Pratos, text=Cardápio").count() > 0
            or page.locator("[data-section], .admin-section").count() > 0
        )
        if has_sections:
            step_ok(steps, "Admin Dashboard Sections")
        else:
            step_warn(
                steps,
                "Admin Dashboard Sections",
                "Expected category/dish sections not found",
            )

        return {"status": "success", "steps": steps}

    except Exception as e:
        step_fail(steps, "Admin Flow Crash", str(e))
        return {"status": "failed", "steps": steps, "error": str(e)}


# ─── API Health Flow ───────────────────────────────────────────────────────────


def run_api_health_flow(page: Page, base_url: str, is_starter: bool) -> dict:
    """Checks /api/plan and /api/categories via fetch within the browser context."""
    steps = []
    try:
        page.goto(base_url)
        page.wait_for_load_state("domcontentloaded")

        # Check /api/plan
        plan_result = page.evaluate(
            f"""
            async () => {{
                const res = await fetch('{base_url.rstrip("/")}/api/plan');
                return {{ status: res.status, body: await res.json() }};
            }}
        """
        )

        if plan_result["status"] == 200:
            plan = plan_result["body"].get("data", {}).get("plan", "unknown")
            step_ok(steps, "GET /api/plan", f"plan={plan}")

            if is_starter and plan != "starter":
                step_warn(
                    steps, "Starter Plan Check", f"Expected 'starter' but got '{plan}'"
                )
            elif not is_starter and plan == "starter":
                step_warn(
                    steps,
                    "Non-Starter Plan Check",
                    "Expected non-starter but got 'starter'",
                )
        else:
            step_fail(steps, "GET /api/plan", f"HTTP {plan_result['status']}")

        # Check /api/categories (public)
        cat_result = page.evaluate(
            f"""
            async () => {{
                const res = await fetch('{base_url.rstrip("/")}/api/categories');
                return {{ status: res.status, count: (await res.json()).data?.length ?? -1 }};
            }}
        """
        )

        if cat_result["status"] == 200:
            step_ok(steps, "GET /api/categories", f"count={cat_result['count']}")
        else:
            step_fail(steps, "GET /api/categories", f"HTTP {cat_result['status']}")

        return {"status": "success", "steps": steps}

    except Exception as e:
        step_fail(steps, "API Health Crash", str(e))
        return {"status": "failed", "steps": steps, "error": str(e)}


# ─── Main runner ───────────────────────────────────────────────────────────────


def run_theme_tests(
    base_url: str, admin_email: str, is_starter: bool, theme_name: str
) -> dict:
    results = {
        "theme": theme_name,
        "base_url": base_url,
        "admin_email": admin_email,
        "client_flow": {},
        "admin_flow": {},
        "api_health": {},
        "summary": "running",
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})

        results["client_flow"] = run_client_flow(
            context.new_page(), base_url, is_starter
        )
        results["admin_flow"] = run_admin_flow(
            context.new_page(), base_url, admin_email
        )
        results["api_health"] = run_api_health_flow(
            context.new_page(), base_url, is_starter
        )

        browser.close()

    # Aggregate summary
    all_flows = [results["client_flow"], results["admin_flow"], results["api_health"]]
    any_failed = any(f.get("status") == "failed" for f in all_flows)
    results["summary"] = "FAIL" if any_failed else "PASS"

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="E2E Playwright tests for restaurant SaaS themes"
    )
    parser.add_argument(
        "--url", default="http://localhost:3000", help="Base URL of the running server"
    )
    parser.add_argument(
        "--admin-email", default=None, help="Override admin email for login"
    )
    parser.add_argument(
        "--theme",
        default="restaurante",
        choices=list(THEME_CONFIGS.keys()),
        help="Theme name to resolve credentials automatically",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of formatted summary",
    )
    args = parser.parse_args()

    config = THEME_CONFIGS.get(args.theme, THEME_CONFIGS["restaurante"])
    admin_email = args.admin_email or config["admin_email"]
    is_starter = config["is_starter"]

    results = run_theme_tests(args.url, admin_email, is_starter, args.theme)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(f"\n{'='*50}")
        print(f"  E2E Results — {results['theme']} @ {results['base_url']}")
        print(f"  Admin: {results['admin_email']}")
        print(f"{'='*50}")
        for flow_name in ("client_flow", "admin_flow", "api_health"):
            flow = results[flow_name]
            flow_status = flow.get("status", "unknown").upper()
            print(f"\n[{flow_name}] Status: {flow_status}")
            for s in flow.get("steps", []):
                icon = (
                    "✓"
                    if s["status"] == "success"
                    else ("!" if s["status"] == "warning" else "✗")
                )
                detail = f" — {s['details']}" if "details" in s else ""
                print(f"  {icon} {s['step']}{detail}")
        print(f"\n{'='*50}")
        print(f"  SUMMARY: {results['summary']}")
        print(f"{'='*50}\n")

    sys.exit(0 if results["summary"] == "PASS" else 1)
