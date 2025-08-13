// ===== Получаем session из URL или sessionStorage =====
function getSessionId() {
	const urlParams = new URLSearchParams(window.location.search);
	let sessionId = urlParams.get('session');

	if (sessionId) {
		sessionStorage.setItem('sessionid', sessionId);
	} else {
		sessionId = sessionStorage.getItem('sessionid');
	}

	return sessionId;
}

// ===== Запрос к бэкенду для получения данных пользователя =====
function toAuthorization(callback) {
	const sessionId = getSessionId();

	if (!sessionId) {
		console.log('Session не найден');
		callback(null);
		return;
	}

	fetch('https://jackhanmacsgolkgame.pythonanywhere.com/ru/user/', {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Session ${sessionId}`

		}
	})
		.then(response => {
			if (!response.ok) {
				console.error('Ошибка авторизации:', response.status);
				return null;
			}
			return response.json();
		})
		.then(user => {
			callback(user, { Authorization: `Session ${sessionId}` });
		})
		.catch(error => {
			console.error('Ошибка запроса к пользователю:', error);
			callback(null);
		});
}

// ===== Основная функция для использования в DOM =====
function toUser(callback) {
	document.addEventListener('DOMContentLoaded', () => {
		toAuthorization((user, sessionHeader) => {
			callback(user, sessionHeader);
		});
	});
}

// ===== Получение ID кейса из URL =====
function getCaseId() {
	const urlParams = new URLSearchParams(window.location.search);
	return Number(urlParams.get('id'));
}

// ===== Обновление UI профиля пользователя =====
function toUserProfileUI(user) {
	if (!user) {
		const profileEl = document.getElementById('user-profile');
		if (profileEl) profileEl.style.display = 'none';
		return;
	}

	const layer1 = document.querySelector('.layer1');
	if (layer1) layer1.style.display = 'none';

	const userProfile = document.getElementById('user-profile');
	userProfile.classList.remove('hidden');

	const userData = Array.isArray(user) ? user[0] : user;

	document.getElementById('user-avatar').src = userData.avatar_url || '';
	document.getElementById('user-nickname').textContent =
		userData.nickname || 'User';
	document.getElementById('user-balance').textContent = userData.balance
		? `${userData.balance}₽`
		: '0.00₽';

	// Обновляем кликабельность кейсов
	const caseElements = document.querySelectorAll('.cases');
	caseElements.forEach(caseElement => {
		const overlay = caseElement.querySelector('.case-overlay');
		if (overlay) caseElement.removeChild(overlay);

		const caseWrapper = caseElement.querySelector('.case-wrapper');
		if (!caseWrapper) return;

		const caseId = caseElement.getAttribute('data-case-id');
		if (!caseId) return;

		const caseLink = document.createElement('a');
		caseLink.href = `case.html?id=${caseId}`;
		caseLink.style.textDecoration = 'none';

		while (caseWrapper.firstChild) {
			caseLink.appendChild(caseWrapper.firstChild);
		}

		caseElement.replaceChild(caseLink, caseWrapper);
	});
}
