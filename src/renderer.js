const { Notification } = require('electron')

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
let currentFilter = 'all'
let editingId = null
let selectedDate = ''
let selectedStatus = 'todo'
let calYear, calMonth

const taskList = document.getElementById('taskList')
const modalOverlay = document.getElementById('modalOverlay')
const taskTitleEl = document.getElementById('taskTitle')
const modalTitleEl = document.getElementById('modalTitle')
const pageTitle = document.getElementById('page-title')

// date picker elements
const customDate = document.getElementById('customDate')
const dateDisplay = document.getElementById('dateDisplay')
const dateClear = document.getElementById('dateClear')
const calendar = document.getElementById('calendar')
const calMonthEl = document.getElementById('calMonth')
const calDaysEl = document.getElementById('calDays')

// dropdown elements
const customSelect = document.getElementById('customSelect')
const selectSelected = document.getElementById('selectSelected')
const selectOptions = document.getElementById('selectOptions')
const selectText = document.getElementById('selectText')

// save
function saveTasks() {
     localStorage.setItem('tasks', JSON.stringify(tasks))
}

// notifications
function notify(title, body) {
     try { new Notification({ title, body }).show() }
     catch (e) { console.log('Notification skipped:', e.message) }
}

function checkDueNotifications() {
     const today = new Date().toISOString().split('T')[0]
     tasks.forEach(t => {
          if (t.due === today && t.status !== 'done') notify('Due today!', t.title)
     })
}

// date helpers
function formatDate(dateStr) {
     if (!dateStr) return null
     const [y, m, d] = dateStr.split('-')
     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
     return `${months[+m - 1]} ${+d}`
}

function isOverdue(dateStr) {
     if (!dateStr) return false
     const today = new Date(); today.setHours(0, 0, 0, 0)
     return new Date(dateStr) < today
}

// counts
function updateCounts() {
     document.getElementById('count-all').textContent = tasks.length
     document.getElementById('count-todo').textContent = tasks.filter(t => t.status === 'todo').length
     document.getElementById('count-progress').textContent = tasks.filter(t => t.status === 'progress').length
     document.getElementById('count-done').textContent = tasks.filter(t => t.status === 'done').length
}

// render
function renderTasks() {
     updateCounts()
     const filtered = currentFilter === 'all' ? tasks : tasks.filter(t => t.status === currentFilter)
     taskList.innerHTML = ''
     if (!filtered.length) {
          taskList.innerHTML = '<div class="empty-state">no tasks here yet.</div>'
          return
     }
     const todayStr = new Date().toDateString()
     const todayTasks = filtered.filter(t => t.due && new Date(t.due + 'T00:00:00').toDateString() === todayStr)
     const otherTasks = filtered.filter(t => !t.due || new Date(t.due + 'T00:00:00').toDateString() !== todayStr)
     if (todayTasks.length) {
          taskList.innerHTML += '<div class="section-label">Today</div>'
          todayTasks.forEach(t => taskList.innerHTML += taskHTML(t))
     }
     if (otherTasks.length) {
          if (todayTasks.length) taskList.innerHTML += '<div class="section-label">Other</div>'
          otherTasks.forEach(t => taskList.innerHTML += taskHTML(t))
     }
}

function taskHTML(t) {
     const overdue = isOverdue(t.due)
     const dueLine = t.due ? `<div class="due ${overdue ? 'overdue' : ''}"><span class="due-dot"></span>${formatDate(t.due)}</div>` : ''
     const badgeClass = { todo: 'badge-todo', progress: 'badge-progress', done: 'badge-done' }[t.status]
     const badgeText = { todo: 'to do', progress: 'active', done: 'done' }[t.status]
     return `
    <div class="task ${t.status === 'done' ? 'done-task' : ''}">
      <div class="task-left">
        <div class="task-title" title="${t.title}">${t.title}</div>
        <div class="task-meta">${dueLine}<span class="badge ${badgeClass}">${badgeText}</span></div>
      </div>
      <div class="task-right">
        <button class="icon-btn" onclick="openEdit('${t.id}')">edit</button>
        <button class="icon-btn del" onclick="deleteTask('${t.id}')">del</button>
      </div>
    </div>`
}

// edit task
function openEdit(id) {
     const task = tasks.find(t => t.id === id)
     if (!task) return
     editingId = id
     taskTitleEl.value = task.title
     setDate(task.due || '')
     setStatus(task.status)
     modalTitleEl.textContent = 'edit task'
     modalOverlay.classList.add('open')
     setTimeout(() => taskTitleEl.focus(), 50)
}

// delete task
function deleteTask(id) {
     tasks = tasks.filter(t => t.id !== id)
     saveTasks(); renderTasks()
}

// ── Calendar ──────────────────────────────────────────────

function setDate(dateStr) {
     selectedDate = dateStr
     if (dateStr) {
          dateDisplay.textContent = formatDate(dateStr)
          dateDisplay.classList.add('selected')
          dateClear.style.display = 'block'
     } else {
          dateDisplay.textContent = 'no date'
          dateDisplay.classList.remove('selected')
          dateClear.style.display = 'none'
     }
}

function openCalendar() {
     const now = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
     calYear = now.getFullYear()
     calMonth = now.getMonth()
     renderCalendar()
     calendar.classList.add('open')
     customDate.classList.add('open')
}

function closeCalendar() {
     calendar.classList.remove('open')
     customDate.classList.remove('open')
}

function renderCalendar() {
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
     calMonthEl.textContent = `${months[calMonth]} ${calYear}`
     const firstDay = new Date(calYear, calMonth, 1).getDay()
     const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
     const daysInPrev = new Date(calYear, calMonth, 0).getDate()
     const today = new Date(); today.setHours(0, 0, 0, 0)
     calDaysEl.innerHTML = ''

     // prev month padding
     for (let i = firstDay - 1; i >= 0; i--) {
          const btn = document.createElement('button')
          btn.className = 'cal-day other-month'
          btn.textContent = daysInPrev - i
          calDaysEl.appendChild(btn)
     }

     // current month
     for (let d = 1; d <= daysInMonth; d++) {
          const btn = document.createElement('button')
          btn.className = 'cal-day'
          btn.textContent = d
          const thisDate = new Date(calYear, calMonth, d)
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          if (thisDate.toDateString() === today.toDateString()) btn.classList.add('today')
          if (dateStr === selectedDate) btn.classList.add('selected')
          btn.addEventListener('click', () => {
               setDate(dateStr)
               closeCalendar()
          })
          calDaysEl.appendChild(btn)
     }

     // next month padding
     const total = firstDay + daysInMonth
     const remaining = total % 7 === 0 ? 0 : 7 - (total % 7)
     for (let d = 1; d <= remaining; d++) {
          const btn = document.createElement('button')
          btn.className = 'cal-day other-month'
          btn.textContent = d
          calDaysEl.appendChild(btn)
     }
}

customDate.addEventListener('click', (e) => {
     if (e.target === dateClear || dateClear.contains(e.target)) return
     calendar.classList.contains('open') ? closeCalendar() : openCalendar()
})

dateClear.addEventListener('click', (e) => {
     e.stopPropagation()
     setDate('')
     closeCalendar()
})

document.getElementById('calPrev').addEventListener('click', () => {
     calMonth--
     if (calMonth < 0) { calMonth = 11; calYear-- }
     renderCalendar()
})

document.getElementById('calNext').addEventListener('click', () => {
     calMonth++
     if (calMonth > 11) { calMonth = 0; calYear++ }
     renderCalendar()
})

// ── Dropdown ──────────────────────────────────────────────

const statusLabels = { todo: 'to do', progress: 'in progress', done: 'done' }
const statusDotClass = { todo: 'dot-todo', progress: 'dot-prog', done: 'dot-done' }

function setStatus(value) {
     selectedStatus = value
     selectText.textContent = statusLabels[value]
     const dot = selectSelected.querySelector('.select-dot')
     dot.className = `select-dot ${statusDotClass[value]}`
     document.querySelectorAll('.select-option').forEach(opt => {
          opt.classList.toggle('active', opt.dataset.value === value)
     })
}

selectSelected.addEventListener('click', () => {
     const isOpen = selectOptions.classList.contains('open')
     selectOptions.classList.toggle('open', !isOpen)
     selectSelected.classList.toggle('open', !isOpen)
     if (!isOpen) closeCalendar()
})

document.querySelectorAll('.select-option').forEach(opt => {
     opt.addEventListener('click', () => {
          setStatus(opt.dataset.value)
          selectOptions.classList.remove('open')
          selectSelected.classList.remove('open')
     })
})

// close dropdowns when clicking outside
document.addEventListener('click', (e) => {
     if (!customDate.contains(e.target) && !calendar.contains(e.target)) closeCalendar()
     if (!customSelect.contains(e.target)) {
          selectOptions.classList.remove('open')
          selectSelected.classList.remove('open')
     }
})

// open modal
document.getElementById('openModal').addEventListener('click', () => {
     editingId = null
     taskTitleEl.value = ''
     setDate('')
     setStatus('todo')
     modalTitleEl.textContent = 'new task'
     modalOverlay.classList.add('open')
     setTimeout(() => taskTitleEl.focus(), 50)
})

// close modal
document.getElementById('closeModal').addEventListener('click', () => {
     modalOverlay.classList.remove('open')
     closeCalendar()
     selectOptions.classList.remove('open')
     selectSelected.classList.remove('open')
})

modalOverlay.addEventListener('click', (e) => {
     if (e.target === modalOverlay) {
          modalOverlay.classList.remove('open')
          closeCalendar()
     }
})

// save task
document.getElementById('saveTask').addEventListener('click', () => {
     const title = taskTitleEl.value.trim()
     if (!title) {
          taskTitleEl.style.borderColor = '#e05252'
          setTimeout(() => taskTitleEl.style.borderColor = '', 1000)
          return
     }
     if (editingId) {
          const task = tasks.find(t => t.id === editingId)
          if (task) { task.title = title; task.due = selectedDate; task.status = selectedStatus }
     } else {
          tasks.unshift({ id: Date.now().toString(), title, due: selectedDate, status: selectedStatus })
          notify('Task added', title)
     }
     saveTasks(); renderTasks()
     modalOverlay.classList.remove('open')
})

// enter to save
document.getElementById('taskTitle').addEventListener('keydown', (e) => {
     if (e.key === 'Enter') document.getElementById('saveTask').click()
})

// filters
document.querySelectorAll('.filter-btn').forEach(btn => {
     btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          currentFilter = btn.dataset.filter
          const labels = { all: 'All Tasks', todo: 'To Do', progress: 'In Progress', done: 'Done' }
          pageTitle.textContent = labels[currentFilter]
          renderTasks()
     })
})

// init
checkDueNotifications()
renderTasks()