import * as multer from 'multer';

const uploader = multer({storage: multer.memoryStorage()})

export default uploader;