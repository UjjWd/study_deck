# 📚 StudyDeck – Smart Notes & Revision Tracker

<div align="center">
<!--   <img src="docs/banner.png" alt="StudyDeck banner" width="100%"/>
  <br/>
  <a href="https://github.com/Sparshga/studydeck-revision-hub/actions"><img src="https://img.shields.io/github/actions/workflow/status/Sparshga/studydeck-revision-hub/ci.yml?branch=main" alt="Build"/></a>
  <a href="https://github.com/Sparshga/studydeck-revision-hub/stargazers"><img src="https://img.shields.io/github/stars/Sparshga/studydeck-revision-hub?style=social" alt="GitHub stars"/></a>
  <a href="https://github.com/Sparshga/studydeck-revision-hub/issues"><img src="https://img.shields.io/github/issues/Sparshga/studydeck-revision-hub" alt="Issues"/></a>
  <a href="https://github.com/Sparshga/studydeck-revision-hub/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Sparshga/studydeck-revision-hub" alt="License"/></a>
  <a href="https://twitter.com/yourhandle"><img src="https://img.shields.io/twitter/follow/yourhandle?style=social" alt="Follow on Twitter"/></a>
</div> -->

> **All‑in‑one web app to capture notes, organise them, add tasks, and crush revisions with data‑driven insights.**

---

![StudyDeck dashboard](docs/screenshot-dashboard.png)
<p align="center">
  <img src="docs/screenshot-analytics.png" alt="Analytics – Pie Charts" width="45%"/>
  <img src="docs/screenshot-notes-page.png" alt="Notes Page" width="45%"/>
</p>
<p align="center">
  <em>Zero‑clutter interface · Full‑stack TypeScript · Mobile‑first design</em>
</p>

---

## ✨ Features

| Category            | Highlights                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Productivity**    | 📝 Rich‑text **note editor**  ·  🗂️ **Folder / tag** organisation · 📑 **PDF import** & in‑app viewer (highlight & annotate coming soon) |
| **Task & Revision** | ✔️ **Task manager** integrated into every note · 📅 **Revision calendar** that tells you exactly what to review each day                  |
| **Analytics**       | 📊 **Advanced dashboard** – dynamic charts (day / month / year, category‑wise) to visualise tasks done & pending                          |
| **Smart Queue**     | 🚀 **Revision queue** prioritises work using spaced‑repetition principles                                                                 |
| **User Experience** | 🌓 **Light / dark** themes · 🔍 Blazing‑fast **search & filters**                                                                         |
| **Security & Sync** | 🔑 Secure **JWT auth** + refresh tokens · ☁️ Deployed on Vercel & Render                                                                  |


---

## 🏗️ Tech Stack

| Layer        | Tech                                                   | Why?                               |
| ------------ | ------------------------------------------------------ | ---------------------------------- |
| **Frontend** | React 18 · TypeScript · Vite · TailwindCSS · shadcn/ui | Fast, type‑safe, beautiful UI      |
| **Backend**  | Node.js · Express                                      | Lightweight REST API               |
| **Database** | MongoDB + Mongoose                                     | Flexible, JSON‑friendly data model |
| **Auth**     | JWT + bcrypt                                           | Proven, stateless security         |
| **DevOps**   | GitHub Actions · Husky · ESLint/Prettier               | CI / code quality                  |


---

## 🛠️ Local Setup

```bash
# Clone the repo
$ git clone https://github.com/Sparshga/studydeck-revision-hub.git
$ cd studydeck-revision-hub

# Install client deps & run
$ npm i && npm run dev                # http://localhost:8080

# Install server deps & run API
$ cd server
$ npm i && npm run dev                # http://localhost:5000
```

### Environment Variables

Create `server/.env`:

```dotenv
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/studydeck
JWT_SECRET=superSecret
EMAIL_USER=example@gmail.com
EMAIL_PASS=app_password
```

> Tip: Copy `.env.example` and fill in your secrets.

---

## 📂 Project Structure

```
├── src/               # React + TS frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── ...
├── server/            # Express backend
│   ├── models/
│   ├── routes/
│   └── utils/
└── docs/              # Screenshots / assets
```

---

## 🛣️ Roadmap

* [ ] Highlight & annotate PDFs
* [ ] Spaced‑repetition algorithm v2
* [ ] Real‑time collaboration
* [ ] Progressive Web App (offline mode)

Got an idea? [Open an issue](https://github.com/Sparshga/studydeck-revision-hub/issues) or vote on an existing one!

---

## 🤝 Contributing

1. **Fork** the project and create your branch: `git checkout -b feature/awesome`
2. Commit your changes: `git commit -m 'feat: add awesome thing'`
3. Push to the branch: `git push origin feature/awesome`
4. Open a Pull Request 🙌

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) first.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more info.

---

## 📫 Contact


* Project Link: [https://github.com/Sparshga/studydeck-revision-hub](https://github.com/Sparshga/studydeck-revision-hub)

---

> Made with ❤️  & double espresso – because studying shouldn’t be boring.
