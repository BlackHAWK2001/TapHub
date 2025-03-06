//multer is used to upload file in backend

import multer from "multer";
const upload = multer({
    storage:multer.memoryStorage(),

});

export default upload;