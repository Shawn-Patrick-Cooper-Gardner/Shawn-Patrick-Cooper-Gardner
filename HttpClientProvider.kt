package com.aerospace13.excalibur.geoint

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

object HttpClientProvider {
    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }

    val client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .build()
}
