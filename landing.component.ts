import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UploadedPdf = {
  name: string;
  subject: string;
  description: string;
  views: number;
  downloads: number;
};

type Quiz = {
  id: number;
  title: string;
  totalMarks: number;
  completed: boolean;
  score: number;
};

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  // UI state
  showModal = false;
  showProfile = false;
  activeProfileTab: 'info' | 'resources' | 'streak' | 'report' = 'info';

  // Account form
  firstName = '';
  lastName = '';
  age: number | null = null;
  gender = '';
  grade = '';
  school = '';
  state = '';
  address = '';
  email = '';
  username = '';
  password = '';

  // Upload form
  uploadSubject = '';
  uploadTitle = '';
  uploadDesc = '';
  uploadedPdfs: UploadedPdf[] = [];

  // To-do + streak
  todos: { text: string; done: boolean }[] = [];
  newTodo = '';
  visitedDates: string[] = [];
  todayIso = new Date().toISOString().slice(0, 10);

  // Quizzes
  quizzes: Quiz[] = [
    { id: 1, title: 'CS Basics Quiz', totalMarks: 10, completed: false, score: 0 },
    { id: 2, title: 'JEE Physics Quiz', totalMarks: 15, completed: false, score: 0 },
    { id: 3, title: 'Chemistry Test', totalMarks: 20, completed: false, score: 0 },
  ];

  // Report Card
  report = { lecturesWatched: 12, quizzesTaken: 5, avgScore: 78, badges: ['Starter', 'Quiz Novice'] };

  // ===== Modal controls =====
  openModal() { this.showModal = true; }
  closeModal() { this.showModal = false; }

  // ===== Profile panel =====
  toggleProfile(open: boolean) { this.showProfile = open; }
  setTab(tab: typeof this.activeProfileTab) { this.activeProfileTab = tab; }

  // ===== Smooth anchor scroll =====
  scrollTo(id: string, event?: Event) {
    if (event) event.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== Save account =====
  saveAccount() {
    const user = {
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      gender: this.gender,
      grade: this.grade,
      school: this.school,
      state: this.state,
      address: this.address,
      email: this.email,
      username: this.username
    };
    localStorage.setItem('el_user', JSON.stringify(user));
    this.closeModal();
    this.showProfile = true;
  }

  // ===== Google Form =====
  goToGoogleForm() {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSc2IT0ltz1MEc6jPEYmlgvkmSibWTP1mJZUlb3OAG9Nol4vRg/viewform?usp=sharing',
      '_blank'
    );
  }

  // ===== Upload PDF =====
  uploadPdf(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadedPdfs.push({
        name: this.uploadTitle || file.name,
        subject: this.uploadSubject || 'General',
        description: this.uploadDesc || '—',
        views: 0,
        downloads: 0
      });
      this.uploadSubject = '';
      this.uploadTitle = '';
      this.uploadDesc = '';
      input.value = '';
      this.persistUploads();
      alert(`✅ ${file.name} uploaded successfully!`);
    }
  }

  incView(idx: number) {
    this.uploadedPdfs[idx].views++;
    this.persistUploads();
  }

  incDownload(idx: number) {
    this.uploadedPdfs[idx].downloads++;
    this.persistUploads();
  }

  // ===== To-do =====
  addTodo() {
    if (!this.newTodo.trim()) return;
    this.todos.push({ text: this.newTodo.trim(), done: false });
    this.newTodo = '';
    this.persistTodos();
  }

  toggleTodo(i: number) {
    this.todos[i].done = !this.todos[i].done;
    this.persistTodos();
  }

  removeTodo(i: number) {
    this.todos.splice(i, 1);
    this.persistTodos();
  }

  // ===== Streak =====
  markVisitToday() {
    if (!this.visitedDates.includes(this.todayIso)) {
      this.visitedDates.push(this.todayIso);
      this.persistStreak();
    }
  }

  isVisited(dateIso: string) {
    return this.visitedDates.includes(dateIso);
  }

  get monthDays(): string[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const nextMonth = new Date(year, month + 1, 1);
    const days: string[] = [];
    for (let d = new Date(first); d < nextMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().slice(0, 10));
    }
    return days;
  }

  // ===== Persist localStorage =====
  persistUploads() {
    localStorage.setItem('el_uploads', JSON.stringify(this.uploadedPdfs));
  }
  persistTodos() {
    localStorage.setItem('el_todos', JSON.stringify(this.todos));
  }
  persistStreak() {
    localStorage.setItem('el_streak', JSON.stringify(this.visitedDates));
  }

  loadPersisted() {
    const u = localStorage.getItem('el_user');
    if (u) {
      const user = JSON.parse(u);
      this.firstName = user.firstName || '';
      this.lastName = user.lastName || '';
      this.age = user.age ?? null;
      this.gender = user.gender || '';
      this.grade = user.grade || '';
      this.school = user.school || '';
      this.state = user.state || '';
      this.address = user.address || '';
      this.email = user.email || '';
      this.username = user.username || '';
    }

    const uploads = localStorage.getItem('el_uploads');
    if (uploads) this.uploadedPdfs = JSON.parse(uploads);

    const todos = localStorage.getItem('el_todos');
    if (todos) this.todos = JSON.parse(todos);

    const streak = localStorage.getItem('el_streak');
    if (streak) this.visitedDates = JSON.parse(streak);
  }

  // ===== Quizzes =====
  startQuiz(quiz: Quiz) {
    // For demo: mark quiz as completed with random score
    quiz.completed = true;
    quiz.score = Math.floor(Math.random() * 101);
    this.updateReport();
    alert(`✅ Quiz "${quiz.title}" completed! Score: ${quiz.score}%`);
  }

  updateReport() {
    this.report.quizzesTaken = this.quizzes.filter(q => q.completed).length;
    const completedScores = this.quizzes.filter(q => q.completed).map(q => q.score);
    this.report.avgScore = completedScores.length
      ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
      : 0;
  }

  ngOnInit() {
    // Scroll reveal animation
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section');
      const triggerBottom = window.innerHeight * 0.85;
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).getBoundingClientRect().top;
        if (sectionTop < triggerBottom) section.classList.add('show');
      });
    });
    this.loadPersisted();
    this.markVisitToday();
  }
}




