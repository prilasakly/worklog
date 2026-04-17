import { get, post } from "./core";
import { fileToBase64, buildFileName } from "./file";

export function useTaskApi() {
	const getTask = () => get("getTask");

	const createTask = (data) => post({ action: "createTask", data });

	const updateTask = (data) => post({ action: "updateTask", data });

	const deleteTask = (id) => post({ action: "deleteTask", id });

	const uploadFileAndCompleteTask = async (file, taskData) => {
		const base64Data = await fileToBase64(file);

		return post({
			action: "uploadAndCompleteTask",
			fileName: buildFileName(
				taskData.nama_task,
				taskData.tanggal_selesai,
				file,
			),
			mimeType: file.type,
			base64Data,
			data: taskData,
		});
	};

	return {
		getTask,
		createTask,
		updateTask,
		deleteTask,
		uploadFileAndCompleteTask,
	};
}
