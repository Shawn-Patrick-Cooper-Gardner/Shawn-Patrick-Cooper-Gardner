plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp") version "1.9.22-1.0.17" apply false
}

android {
    namespace = "com.aerospace13.excalibur.geoint"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aerospace13.excalibur.geoint"
        minSdk = 30 // Android 11 (WHOOP TAB-8US2 Field Unit)
        targetSdk = 34
        versionCode = 10001
        versionName = "1.0.0-PROVENANCE"

        ndk {
            abiFilters.addAll(listOf("arm64-v8a"))
        }

        buildConfigField("String", "AUTHORITY", "\"US 1 AUTHORITY / 13 Aerospace Defense Company\"")
        buildConfigField("String", "PEC_CERT", "\"00711617\"")
        buildConfigField("String", "MIGRATION_RECORD_ID", "\"geo-migrate-2026-10-07-01\"")
        buildConfigField("String", "METADATA_SERVICE_URL", "\"https://api.13adc.gov/v1\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=kotlin.RequiresOptIn",
            "-Xjvm-default=all"
        )
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // HTTP client (OkHttp & Logging Interceptor)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // JSON Serialization (Moshi & Moshi Kotlin reflection / codegen)
    implementation("com.squareup.moshi:moshi:1.15.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.0")

    // AndroidX, Lifecycle & Kotlin Coroutines
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
