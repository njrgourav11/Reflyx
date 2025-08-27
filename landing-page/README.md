# Reflyx Landing Page

A modern, responsive landing page for Reflyx - the privacy-first AI coding assistant for VS Code.

## 🚀 Features

- **Modern Design**: Clean, professional design with dark/light mode support
- **Responsive**: Fully responsive design that works on all devices
- **Performance Optimized**: Built with Next.js 14 for optimal performance
- **SEO Friendly**: Comprehensive SEO optimization with meta tags, structured data, and sitemap
- **Accessibility**: WCAG compliant with proper ARIA labels and semantic HTML
- **Animations**: Smooth animations using Framer Motion
- **PWA Ready**: Progressive Web App capabilities with manifest.json

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Typography**: Inter font family
- **Icons**: Custom SVG icons
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd landing-page
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
landing-page/
├── app/                    # Next.js App Router
│   ├── components/         # Reusable components
│   │   ├── Header.tsx     # Navigation header
│   │   ├── Footer.tsx     # Site footer
│   │   ├── Stats.tsx      # Statistics section
│   │   ├── CodeBlock.tsx  # Code display component
│   │   └── LoadingProvider.tsx # Loading state management
│   ├── features/          # Features page
│   ├── demo/              # Demo page
│   ├── docs/              # Documentation page
│   ├── pricing/           # Pricing page
│   ├── about/             # About page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static assets
│   ├── images/            # Images and media
│   ├── icons/             # Favicon and app icons
│   ├── sitemap.xml        # SEO sitemap
│   ├── robots.txt         # Search engine directives
│   └── manifest.json      # PWA manifest
└── tailwind.config.js     # Tailwind configuration
```

## 🎨 Design System

### Colors
- **Brand**: Purple gradient (#7C3AED to #A855F7)
- **Accent**: Pink (#EC4899)
- **Neutral**: Slate color palette
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font weights 600-800
- **Body**: Font weight 400-500
- **Code**: Monospace font family

### Components
- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: Feature cards, testimonial cards, comparison cards
- **Sections**: Consistent spacing and layout patterns

## 📱 Responsive Design

The landing page is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## ⚡ Performance

- **Core Web Vitals**: Optimized for excellent scores
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for optimal loading
- **Caching**: Proper caching headers and strategies

## 🔍 SEO Features

- **Meta Tags**: Comprehensive meta tags for social sharing
- **Structured Data**: JSON-LD structured data for rich snippets
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling directives
- **Open Graph**: Facebook and social media optimization
- **Twitter Cards**: Twitter-specific meta tags

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push to main branch

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific variables:
```env
NEXT_PUBLIC_SITE_URL=https://reflyx-ai.vercel.app
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Tailwind Configuration
Customize the design system in `tailwind.config.js`:
- Brand colors
- Font families
- Spacing scale
- Component variants

## 📊 Analytics

The site is ready for analytics integration:
- Google Analytics 4
- Plausible Analytics
- Fathom Analytics
- Custom analytics solutions

## 🧪 Testing

Run tests with:
```bash
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🚀 Build & Deploy

```bash
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

## 📝 Content Management

### Adding New Features
1. Update the `features` array in `app/page.tsx`
2. Add corresponding icons to the `i` object
3. Update the features comparison page if needed

### Adding New Testimonials
1. Update the `testimonials` array in `app/page.tsx`
2. Ensure proper quote formatting and attribution

### Updating FAQ
1. Update the `faqs` array in `app/page.tsx`
2. Keep answers concise and helpful

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@reflyx.dev
- Documentation: [docs.reflyx.dev](https://docs.reflyx.dev)

## 🔄 Changelog

### v1.0.0 (2024-01-01)
- Initial release
- Modern responsive design
- SEO optimization
- PWA capabilities
- Performance optimization
- Accessibility compliance

---

Built with ❤️ for the developer community