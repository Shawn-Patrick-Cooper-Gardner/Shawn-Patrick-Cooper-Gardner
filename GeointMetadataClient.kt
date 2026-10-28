package com.aerospace13.excalibur.geoint

import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.io.File
import java.io.IOException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/**
 * Super Project EXCALIBUR // 13 Aerospace Defense Company
 * Android 11 Client Runtime (Device: WHOOP TAB-8US2 / arm64-v8a)
 * OkHttp 4.12.0 & Moshi 1.15.0 Client
 */

@JsonClass(generateAdapter = true)
data class ValidationReport(
    val record_id: String?,
    val project: String?,
    val check_time_utc: String?,
    val artifact_sha256: String?,
    val artifact_bytes: Long?,
    val status: String?,
    val checks: Map<String, Any>?
)

@JsonClass(generateAdapter = true)
data class MetadataRecord(
    val record_id: String,
    val type: String,
    val payload: Map<String, Any>
)

class GeointMetadataClient(
    private val baseUrl: String = "https://api.13adc.gov/v1",
    private val authToken: String? = null,
    private val okHttpClient: OkHttpClient = HttpClientProvider.client
) {
    private val moshi: Moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val recordAdapter = moshi.adapter(MetadataRecord::class.java)
    private val validationReportAdapter = moshi.adapter(ValidationReport::class.java)

    /**
     * Compute SHA-256 checksum locally on Android device
     */
    fun computeSha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { fis ->
            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (fis.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    /**
     * POST /validate - Uploads artifact to the CORE Validation Service
     */
    @Throws(IOException::class)
    fun validateArtifact(artifactFile: File): ValidationReport {
        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart(
                "file",
                artifactFile.name,
                artifactFile.asRequestBody("application/json".toMediaType())
            )
            .build()

        val request = Request.Builder()
            .url("$baseUrl/validate")
            .post(requestBody)
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Validation request failed with HTTP ${response.code}: ${response.message}")
            }
            val responseBody = response.body?.string() ?: throw IOException("Empty validation response")
            return validationReportAdapter.fromJson(responseBody)
                ?: throw IOException("Failed to deserialize validation report")
        }
    }

    /**
     * POST /metadata - Stores metadata record into metadata_store
     */
    @Throws(IOException::class)
    fun storeMetadata(record: MetadataRecord): Boolean {
        val jsonPayload = recordAdapter.toJson(record)
        val body = jsonPayload.toRequestBody("application/json; charset=utf-8".toMediaType())

        val request = Request.Builder()
            .url("$baseUrl/metadata")
            .post(body)
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    /**
     * Overload: POST /metadata by record_id, type, and payload map
     */
    @Throws(IOException::class)
    fun storeMetadata(recordId: String, type: String, payload: Map<String, Any>): Boolean {
        return storeMetadata(MetadataRecord(recordId, type, payload))
    }

    /**
     * GET /metadata/{recordId} - Fetches all stored files for a record ID
     */
    @Throws(IOException::class)
    fun getMetadata(recordId: String): String {
        val request = Request.Builder()
            .url("$baseUrl/metadata/$recordId")
            .get()
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Fetch metadata failed with HTTP ${response.code}")
            }
            return response.body?.string() ?: "{}"
        }
    }
}
