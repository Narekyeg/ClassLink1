// Data Storage (In a real app, this would be a database)
let students = JSON.parse(localStorage.getItem('students')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Custom Alert System
function showCustomAlert(message, type = 'info', title = 'Ծանուցում') {
    const overlay = document.getElementById('custom-alert');
    const alertIcon = document.getElementById('alert-icon-content');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const iconContainer = document.querySelector('.alert-icon');
    
    // Set content
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    // Set icon and colors based on type
    switch (type) {
        case 'error':
            alertIcon.textContent = '❌';
            iconContainer.className = 'alert-icon error';
            break;
        case 'success':
            alertIcon.textContent = '✅';
            iconContainer.className = 'alert-icon success';
            break;
        case 'warning':
            alertIcon.textContent = '⚠️';
            iconContainer.className = 'alert-icon warning';
            break;
        default:
            alertIcon.textContent = 'ℹ️';
            iconContainer.className = 'alert-icon';
    }
    
    // Show the modal
    overlay.classList.remove('hidden');
    
    // Focus the OK button for accessibility
    setTimeout(() => {
        document.getElementById('alert-ok-btn').focus();
    }, 100);
}

function hideCustomAlert() {
    document.getElementById('custom-alert').classList.add('hidden');
}

// Function to get available classrooms for each grade (dynamically from registered students)
function getAvailableClassrooms(grade) {
    const gradeStudents = students.filter(s => s.grade === grade);
    const classrooms = [...new Set(gradeStudents.map(s => s.classroom))];
    return classrooms.sort();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date for teacher dashboard
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    
    // Check if user is already logged in
    if (currentUser) {
        if (currentUser.role === 'student') {
            showStudentDashboard();
        } else {
            showTeacherDashboard();
        }
    } else {
        showRoleSelection();
    }
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Student forms
    document.getElementById('student-login-form').addEventListener('submit', handleStudentLogin);
    document.getElementById('student-register-form').addEventListener('submit', handleStudentRegister);
    
    // Teacher forms
    document.getElementById('teacher-login-form').addEventListener('submit', handleTeacherLogin);
    document.getElementById('teacher-register-form').addEventListener('submit', handleTeacherRegister);
    
    // No longer need grade selection listener for student registration since classroom is now text input
    
    // Grade selection for teacher dashboard
    document.getElementById('teacher-grade-select').addEventListener('change', updateTeacherClassrooms);
    document.getElementById('teacher-classroom-select').addEventListener('change', enableLoadButton);
    
    // Custom alert close button
    document.getElementById('alert-ok-btn').addEventListener('click', hideCustomAlert);
    
    // Close alert when clicking outside the modal
    document.getElementById('custom-alert').addEventListener('click', function(e) {
        if (e.target === this) {
            hideCustomAlert();
        }
    });
    
    // Close alert with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !document.getElementById('custom-alert').classList.contains('hidden')) {
            hideCustomAlert();
        }
    });
}

// Navigation functions
function showRoleSelection() {
    hideAllSections();
    document.querySelector('.role-selection').classList.remove('hidden');
}

function showStudentLogin() {
    hideAllSections();
    document.getElementById('student-section').classList.remove('hidden');
    document.getElementById('student-login-form').classList.remove('hidden');
    document.getElementById('student-register-form').classList.add('hidden');
    document.getElementById('student-login-tab').classList.add('active');
    document.getElementById('student-register-tab').classList.remove('active');
}

function showStudentRegister() {
    document.getElementById('student-login-form').classList.add('hidden');
    document.getElementById('student-register-form').classList.remove('hidden');
    document.getElementById('student-login-tab').classList.remove('active');
    document.getElementById('student-register-tab').classList.add('active');
}

function showTeacherLogin() {
    hideAllSections();
    document.getElementById('teacher-section').classList.remove('hidden');
    document.getElementById('teacher-login-form').classList.remove('hidden');
    document.getElementById('teacher-register-form').classList.add('hidden');
    document.getElementById('teacher-login-tab').classList.add('active');
    document.getElementById('teacher-register-tab').classList.remove('active');
}

function showTeacherRegister() {
    document.getElementById('teacher-login-form').classList.add('hidden');
    document.getElementById('teacher-register-form').classList.remove('hidden');
    document.getElementById('teacher-login-tab').classList.remove('active');
    document.getElementById('teacher-register-tab').classList.add('active');
}

function hideAllSections() {
    document.querySelector('.role-selection').classList.add('hidden');
    document.getElementById('student-section').classList.add('hidden');
    document.getElementById('teacher-section').classList.add('hidden');
    document.getElementById('student-dashboard').classList.add('hidden');
    document.getElementById('teacher-dashboard').classList.add('hidden');
}

// Authentication functions
function handleStudentLogin(e) {
    e.preventDefault();
    const username = document.getElementById('student-username').value;
    const password = document.getElementById('student-password').value;
    
    const student = students.find(s => s.username === username && s.password === password);
    
    if (student) {
        currentUser = { ...student, role: 'student' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showStudentDashboard();
    } else {
        showCustomAlert('Սխալ օգտատիրոջ անուն կամ գաղտնաբառ', 'error', 'Մուտքի սխալ');
    }
}

function handleStudentRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-student-name').value.trim();
    const username = document.getElementById('reg-student-username').value.trim();
    const password = document.getElementById('reg-student-password').value;
    const grade = document.getElementById('reg-student-grade').value;
    const classroom = document.getElementById('reg-student-classroom').value.trim();
    
    // Validate all fields
    if (!name || !username || !password || !grade || !classroom) {
        showCustomAlert('Խնդրում ենք լրացնել բոլոր դաշտերը', 'warning', 'Անհրաժեշտ տվյալներ');
        return;
    }
    
    // Check if username already exists
    if (students.find(s => s.username === username)) {
        showCustomAlert('Այս օգտատիրոջ անունն արդեն գոյություն ունի', 'warning', 'Գրանցման սխալ');
        return;
    }
    
    const newStudent = {
        id: Date.now(),
        name,
        username,
        password,
        grade,
        classroom
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    showCustomAlert('Գրանցումը հաջող էր: Խնդրում ենք մուտք գործել', 'success', 'Հաջողություն');
    // showStudentLogin();
}

function handleTeacherLogin(e) {
    e.preventDefault();
    const username = document.getElementById('teacher-username').value;
    const password = document.getElementById('teacher-password').value;
    
    const teacher = teachers.find(t => t.username === username && t.password === password);
    
    if (teacher) {
        currentUser = { ...teacher, role: 'teacher' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showTeacherDashboard();
    } else {
        showCustomAlert('Սխալ օգտատիրոջ անուն կամ գաղտնաբառ', 'error', 'Մուտքի սխալ');
    }
}

function handleTeacherRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-teacher-name').value;
    const username = document.getElementById('reg-teacher-username').value;
    const password = document.getElementById('reg-teacher-password').value;
    const subject = document.getElementById('reg-teacher-subject').value;
    
    // Check if username already exists
    if (teachers.find(t => t.username === username)) {
        showCustomAlert('Այս օգտատիրոջ անունն արդեն գոյություն ունի', 'warning', 'Գրանցման սխալ');
        return;
    }
    
    const newTeacher = {
        id: Date.now(),
        name,
        username,
        password,
        subject
    };
    
    teachers.push(newTeacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    showCustomAlert('Գրանցումը հաջող էր: Խնդրում ենք մուտք գործել', 'success', 'Հաջողություն');
    showTeacherLogin();
}

// Dashboard functions
function showStudentDashboard() {
    hideAllSections();
    document.getElementById('student-dashboard').classList.remove('hidden');
    
    // Update student info display
    document.getElementById('student-name-display').textContent = currentUser.name;
    document.getElementById('student-grade-display').textContent = currentUser.grade + '-րդ դասարան';
    document.getElementById('student-classroom-display').textContent = currentUser.classroom;
    
    // Check today's attendance
    checkTodayAttendance();
    
    // Load attendance history
    loadStudentHistory();
}

function showTeacherDashboard() {
    hideAllSections();
    document.getElementById('teacher-dashboard').classList.remove('hidden');
    
    // Update teacher info display
    document.getElementById('teacher-name-display').textContent = currentUser.name;
    document.getElementById('teacher-subject-display').textContent = currentUser.subject;
    
    // Reset class selection
    document.getElementById('teacher-grade-select').value = '';
    document.getElementById('teacher-classroom-select').value = '';
    document.getElementById('teacher-classroom-select').innerHTML = '<option value="">Ընտրեք դասասենյակը</option>';
    document.getElementById('load-attendance-btn').disabled = true;
    document.getElementById('class-attendance').classList.add('hidden');
}

// Attendance functions
function checkTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(a => 
        a.studentId === currentUser.id && a.date === today
    );
    
    if (todayAttendance) {
        const status = todayAttendance.status === 'present' ? 'ներկա' : 'բացակա';
        const statusClass = todayAttendance.status === 'present' ? 'status-present' : 'status-absent';
        
        document.getElementById('attendance-message').innerHTML = 
            `Այսօր դուք նշվել եք որպես <span class="${statusClass}">${status}</span>`;
        document.getElementById('attendance-buttons').style.display = 'none';
    } else {
        document.getElementById('attendance-message').textContent = 'Այսօր դեռ ներկայություն չեք նշել';
        document.getElementById('attendance-buttons').style.display = 'flex';
    }
}

function markAttendance(status) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already marked today
    const existingAttendance = attendance.find(a => 
        a.studentId === currentUser.id && a.date === today
    );
    
    if (existingAttendance) {
        showCustomAlert('Այսօր արդեն ներկայություն եք նշել', 'warning', 'Ներկայություն');
        return;
    }
    
    const newAttendance = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        grade: currentUser.grade,
        classroom: currentUser.classroom,
        date: today,
        status: status,
        timestamp: new Date().toISOString()
    };
    
    attendance.push(newAttendance);
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    checkTodayAttendance();
    loadStudentHistory();
    
    const statusText = status === 'present' ? 'ներկա' : 'բացակա';
    showCustomAlert(`Դուք նշվել եք որպես ${statusText}`, 'success', 'Ներկայություն նշված է');
}

function loadStudentHistory() {
    const studentAttendance = attendance
        .filter(a => a.studentId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyContainer = document.getElementById('student-history');
    
    if (studentAttendance.length === 0) {
        historyContainer.innerHTML = '<p>Ներկայության պատմություն չկա</p>';
        return;
    }
    
    historyContainer.innerHTML = studentAttendance
        .map(a => {
            const statusText = a.status === 'present' ? 'Ներկա' : 'Բացակա';
            const statusClass = a.status === 'present' ? 'status-present' : 'status-absent';
            const date = new Date(a.date).toLocaleDateString('hy-AM');
            
            return `
                <div class="history-item">
                    <span>${date}</span>
                    <span class="${statusClass}">${statusText}</span>
                </div>
            `;
        })
        .join('');
}

// Teacher functions
function updateTeacherClassrooms() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroomSelect = document.getElementById('teacher-classroom-select');
    
    classroomSelect.innerHTML = '<option value="">Ընտրեք դասասենյակը</option>';
    
    if (grade) {
        const availableClassrooms = getAvailableClassrooms(grade);
        
        if (availableClassrooms.length > 0) {
            availableClassrooms.forEach(classroom => {
                const option = document.createElement('option');
                option.value = classroom;
                option.textContent = grade + classroom;
                classroomSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Այս դասարանում դեռ աշակերտներ չկան";
            option.disabled = true;
            classroomSelect.appendChild(option);
        }
    }
    
    document.getElementById('load-attendance-btn').disabled = true;
    document.getElementById('class-attendance').classList.add('hidden');
}

function enableLoadButton() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroom = document.getElementById('teacher-classroom-select').value;
    
    document.getElementById('load-attendance-btn').disabled = !(grade && classroom);
}

function loadClassAttendance() {
    const grade = document.getElementById('teacher-grade-select').value;
    const classroom = document.getElementById('teacher-classroom-select').value;
    const date = document.getElementById('attendance-date').value;
    
    if (!grade || !classroom) {
        showCustomAlert('Խնդրում ենք ընտրել դասարանը և դասասենյակը', 'warning', 'Ընտրություն');
        return;
    }
    
    // Get all students in this class
    const classStudents = students.filter(s => s.grade === grade && s.classroom === classroom);
    
    // Get attendance for this date and class
    const dayAttendance = attendance.filter(a => 
        a.grade === grade && a.classroom === classroom && a.date === date
    );
    
    // Create attendance map for quick lookup
    const attendanceMap = {};
    dayAttendance.forEach(a => {
        attendanceMap[a.studentId] = a.status;
    });
    
    // Display students
    const studentsContainer = document.getElementById('students-list');
    
    if (classStudents.length === 0) {
        studentsContainer.innerHTML = '<p>Այս դասարանում աշակերտներ չկան</p>';
    } else {
        studentsContainer.innerHTML = classStudents
            .map(student => {
                const attendanceStatus = attendanceMap[student.id] || 'not-marked';
                let statusText, statusClass;
                
                switch (attendanceStatus) {
                    case 'present':
                        statusText = 'Ներկա';
                        statusClass = 'badge-present';
                        break;
                    case 'absent':
                        statusText = 'Բացակա';
                        statusClass = 'badge-absent';
                        break;
                    default:
                        statusText = 'Չի նշվել';
                        statusClass = 'badge-not-marked';
                }
                
                return `
                    <div class="student-card">
                        <h4>${student.name}</h4>
                        <div class="student-info">
                            <p>Դասարան: ${student.grade}${student.classroom}</p>
                            <p>Օգտատիրոջ անուն: ${student.username}</p>
                        </div>
                        <span class="attendance-badge ${statusClass}">${statusText}</span>
                    </div>
                `;
            })
            .join('');
    }
    
    document.getElementById('class-attendance').classList.remove('hidden');
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showRoleSelection();
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
}