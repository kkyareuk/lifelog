package com.drawervillage.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "ProfileExport")
public class ProfileExportPlugin extends Plugin {
    private byte[] decodeData(String value) {
        int comma = value.indexOf(',');
        String payload = comma >= 0 ? value.substring(comma + 1) : value;
        return android.util.Base64.decode(payload, android.util.Base64.DEFAULT);
    }

    private Uri destination(String filename, String mime, String directory) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, directory + "/DrawerVillage");
            Uri collection = mime.startsWith("image/")
                ? MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                : MediaStore.Downloads.EXTERNAL_CONTENT_URI;
            Uri uri = resolver.insert(collection, values);
            if (uri == null) throw new Exception("저장 위치를 만들지 못했습니다.");
            return uri;
        }
        File folder = new File(getContext().getExternalFilesDir(directory), "DrawerVillage");
        if (!folder.exists() && !folder.mkdirs()) throw new Exception("저장 폴더를 만들지 못했습니다.");
        return Uri.fromFile(new File(folder, filename));
    }

    private OutputStream stream(Uri uri) throws Exception {
        if ("file".equals(uri.getScheme())) return new FileOutputStream(new File(uri.getPath()));
        OutputStream output = getContext().getContentResolver().openOutputStream(uri);
        if (output == null) throw new Exception("파일을 열지 못했습니다.");
        return output;
    }

    @PluginMethod
    public void savePng(PluginCall call) {
        String data = call.getString("data", "");
        String filename = call.getString("filename", "drawer-village-profile.png");
        try {
            Uri uri = destination(filename, "image/png", Environment.DIRECTORY_PICTURES);
            try (OutputStream output = stream(uri)) { output.write(decodeData(data)); }
            JSObject result = new JSObject(); result.put("uri", uri.toString()); call.resolve(result);
        } catch (Exception error) { call.reject(error.getMessage(), error); }
    }

    @PluginMethod
    public void savePdf(PluginCall call) {
        String data = call.getString("data", "");
        String filename = call.getString("filename", "drawer-village-profile.pdf");
        try {
            byte[] bytes = decodeData(data);
            Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bitmap == null) throw new Exception("프로필 이미지를 읽지 못했습니다.");
            PdfDocument document = new PdfDocument();
            int pageWidth = 1240;
            int pageHeight = Math.max(1754, Math.round(pageWidth * (bitmap.getHeight() / (float) bitmap.getWidth())));
            PdfDocument.Page page = document.startPage(new PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create());
            Canvas canvas = page.getCanvas();
            canvas.drawColor(android.graphics.Color.WHITE);
            float scale = Math.min(pageWidth / (float) bitmap.getWidth(), pageHeight / (float) bitmap.getHeight());
            float left = (pageWidth - bitmap.getWidth() * scale) / 2f;
            canvas.save(); canvas.translate(left, 0); canvas.scale(scale, scale); canvas.drawBitmap(bitmap, 0, 0, null); canvas.restore();
            document.finishPage(page);
            Uri uri = destination(filename, "application/pdf", Environment.DIRECTORY_DOWNLOADS);
            try (OutputStream output = stream(uri)) { document.writeTo(output); }
            document.close(); bitmap.recycle();
            JSObject result = new JSObject(); result.put("uri", uri.toString()); call.resolve(result);
        } catch (Exception error) { call.reject(error.getMessage(), error); }
    }

    @PluginMethod
    public void saveJson(PluginCall call) {
        String data = call.getString("data", "");
        String filename = call.getString("filename", "drawer-village-backup.json");
        try {
            Uri uri = destination(filename, "application/json", Environment.DIRECTORY_DOWNLOADS);
            try (OutputStream output = stream(uri)) {
                output.write(data.getBytes(StandardCharsets.UTF_8));
            }
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject(error.getMessage(), error);
        }
    }
}
