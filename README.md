# Ownable

**Build it. Ship it. Own it.** A patient AI mentor that turns an app idea into a step-by-step build plan using free, open-source tools.

**Live:** https://ownable.muhammadmurtuza.com

## Stack
- TanStack Start (React 19, Vite, Nitro) deployed on Vercel (Node.js / Fluid Compute)
- AI: open-weight models via Vercel AI Gateway: `openai/gpt-oss-120b` (Apache-2.0), falling back to DeepSeek V4 Flash and Qwen3. See `src/lib/ai.server.ts`.
- Data & auth: Supabase

## Development
```sh
npm i
vercel env pull   # Supabase keys + AI Gateway OIDC token into .env.local
npm run dev
```

## Deploy
```sh
vercel deploy --prod
```

## Team
- [Muhammad Murtuza Hussain](https://www.linkedin.com/in/muhammadmurtuzahussain/)
- [Aksharaa Guha](https://www.linkedin.com/in/aksharaag/)
- [Abbineshkar Loganathan](https://www.linkedin.com/in/abbineshkar/)

Support us: [Ko-fi](https://ko-fi.com/muhammadmurtuzahussain) · [Buy Me a Coffee](https://buymeacoffee.com/muhammadmurtuza)

Originally prototyped with [Lovable](https://lovable.dev) at the Lovable hackathon, Galway, 2026.
