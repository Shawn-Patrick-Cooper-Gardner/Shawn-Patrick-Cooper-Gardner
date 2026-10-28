package com.aerospace13.excalibur.geoint

import com.squareup.moshi.JsonClass

/**
 * Super Project EXCALIBUR // 13 Aerospace Defense Company
 * Core Metadata & Cryptographic Provenance Models
 * Conforming to:
 * - https://metadata.core/validation_v1.json
 * - https://metadata.core/sbom_v1.json
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
