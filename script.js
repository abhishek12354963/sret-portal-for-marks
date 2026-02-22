(function () {
  const form = document.getElementById('lookup-form');
  const input = document.getElementById('student-id');
  const btn = document.getElementById('btn-submit');
  const formError = document.getElementById('form-error');
  const resultsSection = document.getElementById('results-section');
  const adminSection = document.getElementById('admin-section');
  const resultsName = document.getElementById('results-name');
  const resultsId = document.getElementById('results-id');
  const marksTbody = document.getElementById('marks-tbody');
  const adminStudentsList = document.getElementById('admin-students-list');
  const adminSearch = document.getElementById('admin-search');
  let currentAdminId = '';

  function showError(message) {
    formError.textContent = message || '';
    formError.hidden = !message;
  }

  function setLoading(loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Loading…' : 'View Marks';
  }

  function renderMarks(data) {
    resultsSection.hidden = false;
    adminSection.hidden = true;
    if (adminSearch) adminSearch.value = '';
    resultsName.textContent = data.name || 'Student';
    resultsId.textContent = 'ID: ' + (data.id || '');

    marksTbody.innerHTML = '';
    (data.subjects || []).forEach(function (s) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(s.name) + '</td>' +
        '<td class="num">' + escapeHtml(String(s.marks)) + '</td>' +
        '<td class="num">' + escapeHtml(String(s.maxMarks || 100)) + '</td>';
      marksTbody.appendChild(tr);
    });

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderAdminPanel(data) {
    resultsSection.hidden = true;
    adminSection.hidden = false;
    currentAdminId = 'admin@123';

    adminStudentsList.innerHTML = '';
    (data.students || []).forEach(function (student) {
      const card = document.createElement('div');
      card.className = 'admin-student-card';
      card.setAttribute('data-student-id', student.id);
      
      const header = document.createElement('div');
      header.className = 'admin-student-header';
      header.innerHTML =
        '<div><div class="admin-student-name">' + escapeHtml(student.name) + '</div><div class="admin-student-id">ID: ' + escapeHtml(student.id) + '</div></div>';

      const table = document.createElement('table');
      table.className = 'admin-marks-table';
      table.innerHTML =
        '<thead><tr><th>Assessment</th><th class="num">Marks</th><th class="num">Max</th></tr></thead><tbody></tbody>';

      const tbody = table.querySelector('tbody');
      (student.subjects || []).forEach(function (subject, idx) {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + escapeHtml(subject.name) + '</td>' +
          '<td class="num"><input type="number" min="0" max="' + (subject.maxMarks || 100) + '" value="' + escapeHtml(String(subject.marks)) + '" data-student-id="' + escapeHtml(student.id) + '" data-subject-index="' + idx + '" /></td>' +
          '<td class="num">' + escapeHtml(String(subject.maxMarks || 100)) + '</td>';
        tbody.appendChild(tr);
      });

      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn-save';
      saveBtn.textContent = 'Save Changes';
      saveBtn.setAttribute('data-student-id', student.id);
      saveBtn.onclick = function () {
        saveStudentMarks(student.id);
      };

      const statusDiv = document.createElement('div');
      statusDiv.className = 'save-status';
      statusDiv.hidden = true;
      statusDiv.setAttribute('data-student-id', student.id);

      card.appendChild(header);
      card.appendChild(table);
      card.appendChild(saveBtn);
      card.appendChild(statusDiv);
      adminStudentsList.appendChild(card);
    });

    if (adminSearch) {
      adminSearch.value = '';
      applyAdminFilter('');
      adminSearch.focus();
    }

    adminSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function applyAdminFilter(query) {
    const q = String(query || '').trim().toUpperCase();
    const cards = adminStudentsList ? adminStudentsList.querySelectorAll('.admin-student-card') : [];
    cards.forEach(function (card) {
      const sid = String(card.getAttribute('data-student-id') || '').toUpperCase();
      card.style.display = !q || sid.includes(q) ? '' : 'none';
    });
  }

  function saveStudentMarks(studentId) {
    const safeStudentId = cssEscape(String(studentId || ''));
    const inputs = document.querySelectorAll('input[data-student-id="' + safeStudentId + '"]');
    const subjects = [];
    let hasError = false;

    inputs.forEach(function (input) {
      const idx = parseInt(input.getAttribute('data-subject-index'), 10);
      const maxMarks = parseInt(input.getAttribute('max'), 10) || 100;
      const marks = parseInt(input.value, 10);

      if (isNaN(marks) || marks < 0 || marks > maxMarks) {
        hasError = true;
        return;
      }

      const row = input.closest('tr');
      const name = row.querySelector('td:first-child').textContent.trim();
      subjects[idx] = {
        name: name,
        marks: marks,
        maxMarks: maxMarks
      };
    });

    if (hasError) {
      showSaveStatus(studentId, 'Please enter valid marks', false);
      return;
    }

    const card = document.querySelector('.admin-student-card[data-student-id="' + safeStudentId + '"]');
    const saveBtn = card ? card.querySelector('button.btn-save[data-student-id="' + safeStudentId + '"]') : null;
    
    if (!saveBtn) {
      showSaveStatus(studentId, 'Could not find Save button. Refresh and try again.', false);
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    fetch('/api/marks?adminId=' + encodeURIComponent(currentAdminId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: studentId, subjects: subjects })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          showSaveStatus(studentId, 'Marks saved successfully!', true);
        } else {
          throw new Error(data.error || 'Failed to save');
        }
      })
      .catch(function (err) {
        showSaveStatus(studentId, err.message || 'Failed to save marks', false);
      })
      .finally(function () {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      });
  }

  function showSaveStatus(studentId, message, success) {
    const safeStudentId = cssEscape(String(studentId || ''));
    const statusDiv = document.querySelector('.save-status[data-student-id="' + safeStudentId + '"]');
    statusDiv.textContent = message;
    statusDiv.className = 'save-status ' + (success ? 'success' : 'error');
    statusDiv.hidden = false;
    setTimeout(function () {
      statusDiv.hidden = true;
    }, 3000);
  }

  function cssEscape(value) {
    // Use native CSS.escape when available
    if (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') {
      return CSS.escape(value);
    }
    // Minimal fallback for our IDs (avoid breaking attribute selectors)
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (adminSearch) {
    adminSearch.addEventListener('input', function () {
      applyAdminFilter(adminSearch.value);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');

    const id = (input.value || '').trim();
    if (!id) {
      showError('Please enter your Student ID.');
      input.focus();
      return;
    }

    setLoading(true);

    fetch('/api/marks?id=' + encodeURIComponent(id))
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (body) {
            throw new Error(body.error || 'Could not load marks.');
          }).catch(function () {
            throw new Error(res.status === 404 ? 'No marks found for this Student ID.' : 'Something went wrong.');
          });
        }
        return res.json();
      })
      .then(function (data) {
        if (data.isAdmin) {
          renderAdminPanel(data);
        } else {
          renderMarks(data);
        }
      })
      .catch(function (err) {
        showError(err.message || 'Failed to load marks. Try again.');
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
