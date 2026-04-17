import { get, post } from "./core";
import { fileToBase64, buildFileName } from "./file";

export function useLogbookApi() {
	const getLogbook = () => get("getLogbook");
	const getAssigners = () => get("getAssigners");

	const createLogbook = (data) => post({ action: "createLogbook", data });

	const updateLogbook = (data) => post({ action: "updateLogbook", data });

	const deleteLogbook = (id) => post({ action: "deleteLogbook", id });

	const uploadFileAndCreate = async (file, logbookData) => {
		const base64Data = await fileToBase64(file);

		return post({
			action: "uploadAndCreate",
			fileName: buildFileName(
				logbookData.nama_kegiatan,
				logbookData.tanggal,
				file,
			),
			mimeType: file.type,
			base64Data,
			data: logbookData,
		});
	};

	const uploadFileAndUpdate = async (file, logbookData) => {
		const base64Data = await fileToBase64(file);

		return post({
			action: "uploadAndUpdate",
			fileName: buildFileName(
				logbookData.nama_kegiatan,
				logbookData.tanggal,
				file,
			),
			mimeType: file.type,
			base64Data,
			data: logbookData,
		});
	};

	return {
		getLogbook,
		getAssigners,
		createLogbook,
		updateLogbook,
		deleteLogbook,
		uploadFileAndCreate,
		uploadFileAndUpdate,
	};
}
