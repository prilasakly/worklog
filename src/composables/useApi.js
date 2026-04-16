// src/composables/useApi.js

// ⚠️ UPDATE URL INI dengan URL deployment GAS terbaru Anda ⚠️
const GAS_URL =
	"https://script.google.com/macros/s/AKfycbz7DnE9E2aKlCt9jSaIaZhY1ZL0Gj4LqhRhONbrYCvZ1OXSydojQD3lC8BBebqsExE9/exec";

// ─── GET Request ───────────────────────────────────────────
async function get(action) {
	try {
		const res = await fetch(`${GAS_URL}?action=${action}`, {
			method: "GET",
			redirect: "follow",
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	} catch (err) {
		console.error(`GET ${action} error:`, err);
		throw err;
	}
}

// ─── POST Request ───────────────────────────────────────────
async function post(payload) {
	try {
		const res = await fetch(GAS_URL, {
			method: "POST",
			headers: {
				"Content-Type": "text/plain;charset=utf-8",
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	} catch (err) {
		console.error("POST error:", err);
		throw err;
	}
}

// ─── Helper: Convert file to base64 ────────────────────────
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = reader.result.split(",")[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
}

// ─── API Functions ─────────────────────────────────────────
export function useApi() {
	// ── LOGBOOK ──────────────────────────────────────────────

	async function getLogbook() {
		return get("getLogbook");
	}

	async function getAssigners() {
		return get("getAssigners");
	}

	async function createLogbook(data) {
		return post({ action: "createLogbook", data });
	}

	async function updateLogbook(data) {
		return post({ action: "updateLogbook", data });
	}

	async function deleteLogbook(id) {
		return post({ action: "deleteLogbook", id });
	}

	async function uploadFileAndCreate(file, logbookData) {
		try {
			const base64Data = await fileToBase64(file);
			return await post({
				action: "uploadAndCreate",
				fileName: file.name,
				mimeType: file.type,
				base64Data,
				data: logbookData,
			});
		} catch (err) {
			console.error("uploadFileAndCreate error:", err);
			throw err;
		}
	}

	async function uploadFileAndUpdate(file, logbookData) {
		try {
			const base64Data = await fileToBase64(file);
			return await post({
				action: "uploadAndUpdate",
				fileName: file.name,
				mimeType: file.type,
				base64Data,
				data: logbookData,
			});
		} catch (err) {
			console.error("uploadFileAndUpdate error:", err);
			throw err;
		}
	}

	// ── TASK ─────────────────────────────────────────────────

	async function getTask() {
		return get("getTask");
	}

	async function createTask(data) {
		return post({ action: "createTask", data });
	}

	async function updateTask(data) {
		return post({ action: "updateTask", data });
	}

	async function deleteTask(id) {
		return post({ action: "deleteTask", id });
	}

	// Upload foto sekaligus update status task jadi selesai
	async function uploadFileAndCompleteTask(file, taskData) {
		try {
			const base64Data = await fileToBase64(file);
			return await post({
				action: "uploadAndCompleteTask",
				fileName: file.name,
				mimeType: file.type,
				base64Data,
				data: taskData,
			});
		} catch (err) {
			console.error("uploadFileAndCompleteTask error:", err);
			throw err;
		}
	}

	return {
		// logbook
		getLogbook,
		getAssigners,
		createLogbook,
		updateLogbook,
		deleteLogbook,
		uploadFileAndCreate,
		uploadFileAndUpdate,
		// task
		getTask,
		createTask,
		updateTask,
		deleteTask,
		uploadFileAndCompleteTask,
	};
}
