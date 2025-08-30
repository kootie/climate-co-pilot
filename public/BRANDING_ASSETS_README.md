# EcoGuide AI Branding Assets

## Required Assets to Generate

Since I cannot generate image files directly, you'll need to create these assets from your `ecoguide.jpg` logo:

### Favicon Files
- **favicon.ico** (16x16, 32x32, 48x48 in one .ico file)
- **favicon-16x16.png** (16x16 PNG)
- **favicon-32x32.png** (32x32 PNG)

### App Icons
- **apple-touch-icon.png** (180x180 PNG for iOS)
- **ecoguide-192.png** (192x192 PNG for Android)
- **ecoguide-512.png** (512x512 PNG for high-res displays)

### Social Media Images
- **ecoguide-social.jpg** (1200x630 JPG for Open Graph/Twitter cards)

## How to Create These Assets

### Option 1: Online Tools
1. **Favicon Generator**: https://favicon.io/favicon-converter/
   - Upload your `ecoguide.jpg`
   - Download the generated favicon package
   - Replace the files in `/public/`

2. **App Icon Generator**: https://www.appicon.co/
   - Upload your `ecoguide.jpg`
   - Generate icons for web/PWA
   - Download and place in `/public/`

### Option 2: Manual Creation
1. Open `ecoguide.jpg` in an image editor (Photoshop, GIMP, Canva, etc.)
2. Create the following sizes:
   - 16x16, 32x32 (favicon)
   - 180x180 (Apple touch icon)
   - 192x192, 512x512 (Android/PWA icons)
   - 1200x630 (social sharing image)

### Option 3: Command Line (ImageMagick)
```bash
# Install ImageMagick first
# Create favicon sizes
magick ecoguide.jpg -resize 16x16 favicon-16x16.png
magick ecoguide.jpg -resize 32x32 favicon-32x32.png
magick ecoguide.jpg -resize 180x180 apple-touch-icon.png
magick ecoguide.jpg -resize 192x192 ecoguide-192.png
magick ecoguide.jpg -resize 512x512 ecoguide-512.png

# Create social media image (1200x630)
magick ecoguide.jpg -resize 1200x630^ -gravity center -extent 1200x630 ecoguide-social.jpg

# Create multi-size favicon.ico
magick ecoguide.jpg -resize 16x16 -resize 32x32 -resize 48x48 favicon.ico
```

## Current Status

✅ **Updated Files:**
- `index.html` - Updated with proper meta tags and favicon links
- `site.webmanifest` - Created web app manifest
- `robots.txt` - Already configured correctly

⏳ **Assets Needed:**
- [ ] favicon.ico
- [ ] favicon-16x16.png  
- [ ] favicon-32x32.png
- [ ] apple-touch-icon.png
- [ ] ecoguide-192.png
- [ ] ecoguide-512.png
- [ ] ecoguide-social.jpg

## What's Changed

### HTML Meta Tags
- Removed all Lovable references
- Added proper EcoGuide AI branding
- Updated social media meta tags
- Added favicon and app icon links
- Improved SEO meta tags

### Social Media Sharing
- **Facebook/LinkedIn**: Will show ecoguide-social.jpg (1200x630)
- **Twitter**: Will show ecoguide-social.jpg with proper card format
- **URL**: Updated to ecoguide-ai.vercel.app (update this to your actual domain)

### Progressive Web App
- Added web manifest for "Add to Home Screen" functionality
- Configured app icons for mobile devices
- Set EcoGuide AI branding colors (green theme)

## Testing

After creating the assets:

1. **Favicon**: Check in browser tab
2. **Social Sharing**: Test with:
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector
3. **PWA**: Test "Add to Home Screen" on mobile

## Next Steps

1. Create the image assets listed above
2. Update the domain in `index.html` (change from ecoguide-ai.vercel.app to your actual domain)
3. Test all social sharing links
4. Verify favicon appears correctly across browsers
