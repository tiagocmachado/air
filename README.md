# Merge Videos

## Development server

Run `npm run serve` for a dev server. Navigate to `http://localhost:5000/`. The app will automatically reload if you change any of the source files.

## Implementation

Create Node JS service without any third party.
Using fluent-ffmpeg to resize and merge videos.

The user should write the urls of the videos in text inputs, or can use the prefilled ones.
After that the videos are resized into the same size, and merged.

When the merge is finished Pop up a download button that enabled the user to download the merged video.

