package com.aerospace13.excalibur.geoint

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

/**
 * Super Project EXCALIBUR // 13 Aerospace Defense Company
 * Android 11 Client Runtime (Device: WHOOP TAB-8US2 / arm64-v8a)
 */
class ExcaliburMetadataApi(
    private val baseUrl: String,
    private val client: OkHttpClient = HttpClientProvider.client
) {
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val validationAdapter = moshi.adapter(ValidationReport::class.java)
    private val metadataAdapter = moshi.adapter(MetadataRecord::class.java)

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Upload a JSON artifact to /validate and get a ValidationReport back.
     */
    fun validateArtifact(jsonFile: File): ValidationReport? {
        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart(
                name = "file",
                filename = jsonFile.name,
                body = jsonFile.asRequestBody("application/json".toMediaType())
            )
            .build()

        val request = Request.Builder()
            .url("$baseUrl/validate")
            .post(requestBody)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IllegalStateException("Validation failed: ${response.code}")
            }
            val body = response.body?.string() ?: return null
            return validationAdapter.fromJson(body)
        }
    }

    /**
     * Store a metadata record in the unified stack via /metadata.
     */
    fun storeMetadata(record: MetadataRecord): Boolean {
        val json = metadataAdapter.toJson(record)
        val body = json.toRequestBody(jsonMediaType)

        val request = Request.Builder()
            .url("$baseUrl/metadata")
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    /**
     * Store and sign a metadata record via /metadata/signed.
     */
    fun storeSignedMetadata(record: MetadataRecord): Boolean {
        val json = metadataAdapter.toJson(record)
        val body = json.toRequestBody(jsonMediaType)

        val request = Request.Builder()
            .url("$baseUrl/metadata/signed")
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            return response.isSuccessful
        }
    }

    /**
     * Verify a signed record envelope via /verify.
     */
    fun verifySignature(signedRecordJson: String): Boolean {
        val body = signedRecordJson.toRequestBody(jsonMediaType)

        val request = Request.Builder()
            .url("$baseUrl/verify")
            .post(body)
            .build()

        client.newCall(request).execute().use { response ->
            val result = response.body?.string() ?: return false
            val json = moshi.adapter(Map::class.java).fromJson(result)
            return json?.get("valid") == true
        }
    }

    /**
     * Overload: Verify a signed record envelope map via /verify.
     */
    fun verifySignature(signedEnvelope: Map<String, Any>): Boolean {
        val adapter = moshi.adapter(Map::class.java)
        val json = adapter.toJson(signedEnvelope)
        return verifySignature(json)
    }
}
