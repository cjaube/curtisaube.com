---
title: "Processing Image Orientation Data"
date: 2020-05-08
categories: 
  - "progress-openedge"
tags: 
  - "abl"
  - "image-orientation"
  - "jpeg"
  - "openedge"
  - "progress"
coverImage: "cellphone-selfie-of-railroad-and-sky.jpg"
---

Late last year, I was looking into a reported issue that images were not displaying in the correct orientation on the web. It appeared to only happen when uploading pictures that were taken on certain cellphones. We eventually narrowed down the issue to JPEG orientation data.

First, let's look at what's happening here, and then we'll look at ways to fix it.

The JPEG image format uses the Exchangeable image file format (Exif) standard. Exif contains metadata for a photo, such as GPS information, date and time, camera model and manufacturer, and settings used like exposure, ISO speed, orientation, and focal length. The orientation data is set when a picture is taken based on the device's sensors. When you view the image on your phone or computer, the image viewer interprets that orientation data and rotates the image to display it properly. This even works when you open the image with a browser. The problem happens when the image is included on a page using an img tag, the image's orientation data is ignored.

Now on to the fix! The good news is, Chrome just recently started displaying images correctly based on the orientation data in release 81. The new [Edge Chromium](https://support.microsoft.com/en-us/help/4501095/download-the-new-microsoft-edge-based-on-chromium) also includes this fix. Safari has started doing this as well. For Firefox, you can get the image to display correctly with the [image-orientation](https://developer.mozilla.org/en-US/docs/Web/CSS/image-orientation) css property.

```css
img {
  image-orientation: from-image; /* Use EXIF data from the image */
}
```

So this is great if you only need to support those browsers, but if you need to support other browsers (Like IE11), you may need to look at a JavaScript or server-side solution.

I decided to go with a server-side solution (At the time, Chrome still hadn't released their fix). The idea is that, when an image is uploaded, the image orientation data is read and then applied to the image so that no image rotation is required by the browser. We'll be using Progress OpenEdge with .NET libraries.

Let's assume we have a memptr with some image data and an image name. We'll need to convert the image data to .NET Byte array and then from a Byte array to a .NET Image object. I'm not going to cover the details here, but I've included the [source](https://github.com/cjaube/OpenEdgeUtilities/blob/master/source/ImageProcessor.cls). Once we have the image object, we can start processing our image. First, we get the Exif orientation data.

```c
def var img as System.Drawing.Image no-undo.
def var exifOrientationID as int init 274 no-undo. //0x112
def var prop as System.Drawing.Imaging.PropertyItem no-undo.
def var exifOrientation as int no-undo

prop = img:GetPropertyItem(exifOrientationID).
exifOrientation = prop:Value:GetValue(0).
```

We retrieved the orientation property from the image and then got the value which is an integer between 1 and 8. From the documentation, here's what the numbers mean:

```c
1 = The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
2 = The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
3 = The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
4 = The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
5 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
6 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
7 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
8 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom. 
```

The 0th row is referring to the raw top side of the image and the 0th column is referring to the raw left side of the image before any rotation has been performed. So we see from the list above that 1 means no rotation. Note that this also supports mirrored image scenarios. Using this information, we can determine what rotation operations we need to perform on our image.

```c
    case exifOrientation:
        when 2 then Img:RotateFlip(RotateFlipType:RotateNoneFlipX).
        when 3 then Img:RotateFlip(RotateFlipType:Rotate180FlipNone).
        when 4 then Img:RotateFlip(RotateFlipType:Rotate180FlipX).
        when 5 then Img:RotateFlip(RotateFlipType:Rotate90FlipX).
        when 6 then Img:RotateFlip(RotateFlipType:Rotate90FlipNone).
        when 7 then Img:RotateFlip(RotateFlipType:Rotate270FlipX).
        when 8 then Img:RotateFlip(RotateFlipType:Rotate270FlipNone).
    end.
```

Now we just need to remove the orientation data from the image (or set it to 1) since the image no longer needs any rotation.

```c
Img:RemovePropertyItem(exifOrientationID).
```

Once we've completed the rotation operation, we just need to convert the image back to a memptr. One issue I found in doing this is that if no rotations operations were performed, the image:Save would throw an exception. To get around this, I just returned the original image data when there's no rotation to perform.

Now, when the browser requests the image, the server gives it a pre-rotated image with no Exif orientation data, therefor rendering perfectly across all browsers.

Check out the [full source](https://github.com/cjaube/OpenEdgeUtilities/blob/master/source/ImageProcessor.cls) and let me know what you think in the comments!
