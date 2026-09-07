from fastapi import FastAPI,Header,HTTPException
from pydantic import BaseModel
import face_recognition
import numpy as np
from PIL import Image,ImageOps
import base64,io,os,re

# creating the app or initiallizing the app
app = FastAPI()

# calling the face service key from the environment variable
FACE_SERVICE_KEY=os.environ.get("FACE_SERVICE_KEY") 


# creating the validator for the image as in zod we're doing with pydantic
class EncodeRequest(BaseModel):
    image:str

# we're having the response model for the response
class EncodeResponse(BaseModel):
    success:bool
    encoding:list[float] | None = None
    reason:str | None = None
    detail:str | None = None

@app.get("/health")
def health():
    return {"status":"ok"}

@app.post("/encode",response_model=EncodeResponse)
def encode(payload:EncodeRequest,x_internal_key:str = Header(None)):
    if FACE_SERVICE_KEY and x_internal_key != FACE_SERVICE_KEY:
        raise HTTPException(status_code=401,detail="Unauthorized")
    try: 
        img = _decode_image(payload.image)
    except HTTPException:
        raise
    except Exception as e:
        return EncodeResponse(success=False, reason="decode_failed", detail=str(e))
    
    np_image = np.array(img)
    face_locations = face_recognition.face_locations(np_image,model="hog")
    
    if len(face_locations) == 0:
        return EncodeResponse(success=False,reason="no_face_found")
    if len(face_locations)>1:
        return EncodeResponse(success=False,reason="multiple_faces_found")
    
    top,right,bottom,left = face_locations[0]
    width = right-left
    height = bottom-top
    
    if width<60 or height<60:
        return EncodeResponse(success=False,reason="face_too_Small")
    
    encodings = face_recognition.face_encodings(np_image,known_face_locations=face_locations,num_jitters=3)
    
    return EncodeResponse(success=True,encoding=encodings[0].tolist())
    
def _decode_image(image_field:str) -> Image.Image:
    if "," in image_field and image_field.startswith("data:"):
        image_field = image_field.split(",")[1]

    
    img_bytes = base64.b64decode(image_field)

    if len(img_bytes) > 8_000_000:
        raise HTTPException(status_code=400 , detail= "Image is too large not able to process it ")

    img = Image.open(io.BytesIO(img_bytes)) # we're opening the image into the bytes
    img= ImageOps.exif_transpose(img) # we're using the exif transpose to get the image in the correct orientation
    img= img.convert("RGB") # we're converting the image to RGB

    if max(img.size)>800:
        img.thumbnail((800,800))

    return img


