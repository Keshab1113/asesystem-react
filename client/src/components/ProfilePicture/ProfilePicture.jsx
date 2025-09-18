import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Slider } from "../ui/slider";
import Cropper from "react-easy-crop";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Upload } from "lucide-react";
import useToast from "../../hooks/ToastContext";
import { updateUser } from "../../redux/slices/authSlice";
import { Button } from "../ui/button";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, crop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, "image/jpeg");
  });
}

const ProfilePicture = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(user);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(
    userData?.profile_pic_url || null
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveImage = async () => {
    setIsImageUploading(true);
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImgBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      const blobResponse = await axios.get(croppedImgBase64, {
        responseType: "blob",
      });
      const blob = blobResponse.data;
      const croppedFile = new File([blob], imageFile?.name || "profile.jpg", {
        type: blob.type,
      });
      const formData = new FormData();
      formData.append("profilePic", croppedFile);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsImageUploading(false);
      setCroppedImage(response?.data?.profilePic);
      const newUserData = {
        ...userData,
        profile_pic_url: response?.data?.profilePic,
      };
      dispatch(updateUser(newUserData));
      toast({
        title: "Profile Picture",
        description: "Profile picture uploaded.",
        variant: "success"
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={croppedImage || "/admin-avatar.png"}
                alt={userData?.name}
              />
              <AvatarFallback className="text-lg">
                {userData?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              accept="image/*"
              id="profileInput"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              onClick={() => document.getElementById("profileInput")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Photo
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          {imageSrc && (
            <div className="relative w-full h-64 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm mb-1">Zoom</p>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0])}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className=" cursor-pointer"
            >
              Cancel
            </Button>
            {isImageUploading ? (
              <Button className=" cursor-pointer opacity-50">Loading...</Button>
            ) : (
              <Button onClick={handleSaveImage} className=" cursor-pointer">
                Save
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePicture;
