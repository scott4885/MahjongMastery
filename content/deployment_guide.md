# COMPLETE DEPLOYMENT GUIDE
## GitHub Pages + Stripe + Email Automation

---

## OVERVIEW

You'll set up:
1. **GitHub Pages** (free website hosting)
2. **Stripe** (payment processing)
3. **EmailOctopus or ConvertKit** (email automation & PDF delivery)
4. **Zapier** (connects everything together)

**Total setup time:** 2-3 hours  
**Monthly cost:** $20-40 (Stripe fees + email platform)

---

## PART 1: GITHUB PAGES SETUP (Free Hosting)

### Step 1: Create GitHub Account
1. Go to https://github.com
2. Click "Sign up"
3. Create account (use professional email)
4. Verify your email

### Step 2: Create New Repository
1. Click the "+" icon (top right) → "New repository"
2. Repository name: `mahjongmastery` (or your preferred name)
3. **Important:** Check "Public" (required for GitHub Pages)
4. Check "Add a README file"
5. Click "Create repository"

### Step 3: Upload Your Website Files

**Option A: Via Web Interface (Easiest for beginners)**

1. In your repository, click "Add file" → "Create new file"
2. Name it: `index.html`
3. Copy the ENTIRE website code from the artifact I created
4. Paste it into the file editor
5. Scroll down, click "Commit new file"

**Option B: Via Git (If you're familiar with command line)**

```bash
git clone https://github.com/YOUR-USERNAME/mahjongmastery.git
cd mahjongmastery
# Create index.html and paste the website code
git add index.html
git commit -m "Add website"
git push origin main
```

### Step 4: Enable GitHub Pages

1. In your repository, click "Settings" (top menu)
2. Scroll to "Pages" in left sidebar
3. Under "Source," select "main" branch
4. Click "Save"
5. Wait 2-3 minutes
6. Your site will be live at: `https://YOUR-USERNAME.github.io/mahjongmastery/`

### Step 5: (Optional) Add Custom Domain

If you want a custom domain (like `mahjongmastery.com`):

1. Buy domain from Namecheap, Google Domains, or GoDaddy
2. In GitHub Settings → Pages, add custom domain
3. In your domain registrar's DNS settings, add:
   - **A records** pointing to GitHub IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - **CNAME record**: `www` → `YOUR-USERNAME.github.io`
4. Wait 24 hours for DNS propagation

---

## PART 2: STRIPE SETUP (Payment Processing)

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Enter business details:
   - Business name: MahjongMastery (or your LLC name)
   - Type: Individual or Company
   - Industry: Digital Products / Education
   - Website: Your GitHub Pages URL
4. Verify your email
5. Complete identity verification (requires ID)

### Step 2: Create Products in Stripe

1. Log into Stripe Dashboard
2. Click "Products" in left sidebar
3. Click "+ Add product"

**Create each product:**

**Product 1: FREE Tile Set Guide**
- Name: "FREE Mahjong Tile Set Buyer's Guide"
- Price: $0.00
- Type: One-time
- Click "Save product"

**Product 2: Mahjong 101**
- Name: "Mahjong 101: American Mahjong Made Simple"
- Price: $37.00
- Type: One-time
- Click "Save product"

**Product 3: Mahjong 201**
- Name: "Mahjong 201: The Consistency Playbook"
- Price: $67.00
- Type: One-time
- Click "Save product"

**Product 4: Mahjong 301**
- Name: "Mahjong 301: Advanced Strategy Guide"
- Price: $97.00
- Type: One-time
- Click "Save product"

**Product 5: Bundle**
- Name: "Complete Mastery Bundle (All 3 Guides)"
- Price: $149.00
- Type: One-time
- Click "Save product"

### Step 3: Create Payment Links

For EACH product:

1. Go to product page in Stripe
2. Click "Create payment link"
3. **Collect customer information:** ✅ Email (required), ✅ Name (optional)
4. **After payment:** Redirect to custom URL
   - Create a "Thank You" page: `https://yourdomain.com/thank-you.html`
5. Click "Create link"
6. **Copy the payment link URL** (you'll use this soon)

**Save these links in a document:**
```
FREE Guide: https://buy.stripe.com/XXXXX
Mahjong 101: https://buy.stripe.com/XXXXX
Mahjong 201: https://buy.stripe.com/XXXXX
Mahjong 301: https://buy.stripe.com/XXXXX
Bundle: https://buy.stripe.com/XXXXX
```

### Step 4: Update Website with Stripe Links

**In your `index.html` file, find all the buttons and replace the modal code with direct Stripe links:**

Find:
```html
<button class="btn btn-primary" onclick="openModal('101')">Get Mahjong 101</button>
```

Replace with:
```html
<a href="https://buy.stripe.com/YOUR-STRIPE-LINK-101" class="btn btn-primary">Get Mahjong 101</a>
```

Do this for ALL products (101, 201, 301, bundle, free guide).

**Alternative (Keep Modal, Add Stripe):**
Keep the modal for email collection, but add Stripe Checkout:

1. In modal, add a hidden field for product selection
2. On submit, redirect to appropriate Stripe payment link
3. Use Stripe.js for embedded checkout (more advanced)

---

## PART 3: EMAIL AUTOMATION & PDF DELIVERY

**Recommended platforms:**
- **EmailOctopus** ($9/month for up to 2,500 contacts) - easiest
- **ConvertKit** ($29/month) - more features
- **Mailchimp** (free up to 500 contacts, limited automation)

### Using EmailOctopus (Recommended for Beginners)

#### Step 1: Create EmailOctopus Account

1. Go to https://emailoctopus.com
2. Sign up (free 14-day trial, then $9/month)
3. Verify email

#### Step 2: Create Lists

Create separate lists for each product:
1. Click "Lists" → "Create a list"
2. Create lists:
   - "Free Tile Set Guide"
   - "Mahjong 101 Customers"
   - "Mahjong 201 Customers"
   - "Mahjong 301 Customers"
   - "Bundle Customers"

#### Step 3: Upload PDF Guides

1. Upload your PDF files to a cloud storage:
   - **Google Drive** (easiest): Upload PDFs, set sharing to "Anyone with link can view", copy links
   - **Dropbox**: Same process
   - **Your own server**: If you have one

2. Get direct download links:
   - Google Drive: Right-click PDF → "Get link" → Copy
   - Format: `https://drive.google.com/file/d/FILE_ID/view`

#### Step 4: Create Automated Welcome Emails

For each list:

1. Go to "Automations" → "Create automation"
2. Trigger: "Contact subscribes to list"
3. Select the list (e.g., "Mahjong 101 Customers")
4. Add action: "Send email"
5. Email subject: "Your Mahjong 101 Guide is Ready! 📥"
6. Email body:

```
Hi {FIRST_NAME | there},

Thank you for your purchase! Your Mahjong 101 guide is ready.

👉 DOWNLOAD YOUR GUIDE HERE:
[Insert Google Drive link or clickable button]

What's Inside:
✅ Complete American Mahjong rules
✅ Charleston step-by-step strategy
✅ Joker rules explained clearly
✅ Quick reference cheat sheets
✅ First 5 Games Tracker

Questions? Reply to this email anytime.

Happy playing!

The MahjongMastery Team
www.mahjongmastery.com
```

7. Save and activate automation

**Repeat for all products** (Free Guide, 101, 201, 301, Bundle).

For the bundle, include ALL THREE download links.

---

## PART 4: CONNECTING STRIPE TO EMAIL (via Zapier)

Zapier connects Stripe payments to EmailOctopus automatically.

### Step 1: Create Zapier Account

1. Go to https://zapier.com
2. Sign up (free plan works for low volume)
3. Verify email

### Step 2: Create Zaps (Automations)

You'll create one Zap for EACH product.

**ZAP TEMPLATE:**

1. Click "Create Zap"
2. **Trigger:** Stripe → "New Payment"
3. Connect Stripe account → Test trigger
4. **Filter (Important):** Only continue if product name matches
   - Example: "Product Name" → "Exactly matches" → "Mahjong 101"
5. **Action:** EmailOctopus → "Add/Update Contact"
6. Connect EmailOctopus account
7. Map fields:
   - Email: Use Stripe customer email
   - First Name: Use Stripe customer name
   - List: Select "Mahjong 101 Customers"
8. Test the Zap
9. Turn it ON

**Repeat for each product:**
- FREE Guide Zap
- Mahjong 101 Zap
- Mahjong 201 Zap
- Mahjong 301 Zap
- Bundle Zap (add to "Bundle Customers" list)

**Free Zapier plan allows 100 tasks/month.** If you exceed, upgrade to $20/month.

---

## PART 5: CREATE THANK YOU PAGE

Create a simple thank-you page on your GitHub site.

**File: `thank-you.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You! - MahjongMastery</title>
    <style>
        body {
            font-family: Georgia, serif;
            background: linear-gradient(135deg, rgba(232, 213, 203, 0.4), rgba(245, 237, 227, 0.6));
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .thank-you-box {
            background: white;
            padding: 60px;
            border-radius: 25px;
            text-align: center;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4a4039;
            font-size: 42px;
            margin-bottom: 20px;
        }
        p {
            color: #6b5d52;
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 15px;
        }
        .check {
            font-size: 80px;
            color: #a8b5a0;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="thank-you-box">
        <div class="check">✓</div>
        <h1>Thank You for Your Purchase!</h1>
        <p><strong>Check your email inbox</strong> (and spam folder) in the next 2-3 minutes.</p>
        <p>Your guide(s) will be delivered via email with instant download links.</p>
        <p style="margin-top: 30px;">Questions? Email us at: <strong>support@mahjongmastery.com</strong></p>
        <p style="margin-top: 30px;"><a href="/" style="color: #c9a68a; text-decoration: none;">← Back to MahjongMastery.com</a></p>
    </div>
</body>
</html>
```

Upload this to GitHub as `thank-you.html`.

---

## PART 6: TESTING THE ENTIRE SYSTEM

### Test Checklist:

1. **Test FREE guide:**
   - Click "Download FREE Guide" button
   - Goes to Stripe payment link (shows $0)
   - Enter email
   - Complete "purchase"
   - Redirected to thank-you page
   - Check email → Should receive guide link within 2 mins

2. **Test paid product (use Stripe test mode):**
   - Enable "Test mode" in Stripe (toggle in dashboard)
   - Use test card: 4242 4242 4242 4242, any future expiry, any CVC
   - Complete test purchase
   - Check Zapier → Should trigger
   - Check EmailOctopus → Contact should be added
   - Check email → Should receive guide

3. **Test all 5 products** (FREE, 101, 201, 301, Bundle)

4. **Switch Stripe to LIVE mode** when ready to accept real payments

---

## PART 7: FACEBOOK ADS SETUP (Bonus)

### Pixel Installation

1. Go to Facebook Events Manager
2. Create a Facebook Pixel
3. Copy pixel code
4. Add to your `index.html` before `</head>`:

```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR-PIXEL-ID');
  fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->
```

### Track Purchases

Add to thank-you page:

```html
<script>
  fbq('track', 'Purchase', {
    value: 37.00, // Change based on product
    currency: 'USD'
  });
</script>
```

---

## FULL SYSTEM FLOW DIAGRAM

```
1. User visits website (GitHub Pages)
   ↓
2. Clicks "Get Mahjong 101"
   ↓
3. Redirected to Stripe payment link
   ↓
4. Enters email + payment info
   ↓
5. Stripe processes payment
   ↓
6. User redirected to thank-you page
   ↓
7. Zapier detects new Stripe payment
   ↓
8. Zapier adds customer to EmailOctopus list
   ↓
9. EmailOctopus sends automated welcome email with PDF link
   ↓
10. Customer downloads guide
   ↓
11. (Optional) Email sequence continues (upsells, tips, etc.)
```

---

## MONTHLY COSTS BREAKDOWN

- **GitHub Pages:** FREE
- **Stripe:** 2.9% + $0.30 per transaction
- **EmailOctopus:** $9/month (up to 2,500 contacts)
- **Zapier:** FREE (up to 100 tasks/month) or $20/month
- **Domain (optional):** $12/year

**Total:** ~$9-30/month depending on volume

---

## ALTERNATIVE: ALL-IN-ONE PLATFORMS

If you want to avoid stitching together multiple tools, consider:

**Gumroad** (https://gumroad.com)
- Handles payments + PDF delivery automatically
- 10% fee per sale
- Easiest option, higher fees

**ThriveCart** (https://thrivecart.com)
- One-time $495 payment (no monthly fees)
- Built-in email delivery
- Professional checkout pages

**Podia** (https://podia.com)
- $39/month
- Includes payments, email, and course hosting
- All-in-one solution

---

## NEXT STEPS

1. ☐ Set up GitHub Pages (30 mins)
2. ☐ Create Stripe account + products (45 mins)
3. ☐ Set up EmailOctopus + automations (30 mins)
4. ☐ Connect via Zapier (30 mins)
5. ☐ Upload PDFs to Google Drive
6. ☐ Test entire flow with test purchases
7. ☐ Switch Stripe to live mode
8. ☐ Launch Facebook Ads

---

## SUPPORT RESOURCES

- **GitHub Pages Docs:** https://pages.github.com
- **Stripe Docs:** https://stripe.com/docs
- **EmailOctopus Help:** https://emailoctopus.com/help
- **Zapier Templates:** https://zapier.com/app/zaps

**Need help?** Feel free to ask me for clarification on any step!

---

**You're ready to launch! 🚀**