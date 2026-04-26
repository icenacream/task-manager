# taskflow

A lightweight desktop task manager widget built with Electron. Sits on the right side of your screen, stays on top of all windows, and remembers its position after every restart.

---

## features

- Add, edit, and delete tasks
- Set due dates with a custom calendar picker
- Track status — to do, in progress, done
- Desktop notifications for tasks due today
- Always-on-top widget that saves its position

---

## getting started

### prerequisites

- [Node.js](https://nodejs.org) (LTS version)

### install & run

```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager
npm install
npm start
```

### build as a windows app

```bash
npm run build
```

This generates a `dist/TaskFlow Setup 1.0.0.exe` installer you can run on any Windows machine.

---

## tech stack

- [Electron](https://www.electronjs.org)
- [electron-store](https://github.com/sindresorhus/electron-store) — persistent window position
- Vanilla HTML, CSS, JS — no frontend framework

---
