package com.aerospace13.excalibur.geoint

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

/**
 * Super Project EXCALIBUR // 13 Aerospace Defense Company
 * Android 11 Architecture ViewModel for Field Tablet Migration & Validation
 */
class ProvenanceViewModel(
    baseUrl: String = "https://api.13adc.gov/v1"
) : ViewModel() {

    private val api = ExcaliburMetadataApi(
        baseUrl = baseUrl
    )

    fun validateLocalArtifact(jsonFile: File, onResult: (ValidationReport?) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val report = api.validateArtifact(jsonFile)
                withContext(Dispatchers.Main) {
                    onResult(report)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onResult(null)
                }
            }
        }
    }

    fun pushMetadata(record: MetadataRecord, onDone: (Boolean) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            val ok = try {
                api.storeMetadata(record)
            } catch (e: Exception) {
                false
            }
            withContext(Dispatchers.Main) {
                onDone(ok)
            }
        }
    }

    fun pushSignedMetadata(record: MetadataRecord, onDone: (Boolean) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            val ok = try {
                api.storeSignedMetadata(record)
            } catch (e: Exception) {
                false
            }
            withContext(Dispatchers.Main) {
                onDone(ok)
            }
        }
    }

    fun verifySignature(signedRecordJson: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            val valid = try {
                api.verifySignature(signedRecordJson)
            } catch (e: Exception) {
                false
            }
            withContext(Dispatchers.Main) {
                onResult(valid)
            }
        }
    }
}