package com.awwab.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.Center) {
                        Text("Awwab", style = MaterialTheme.typography.headlineLarge)
                        Text("Personal AI operating assistant", modifier = Modifier.padding(top = 8.dp))
                        Button(onClick = {}, modifier = Modifier.padding(top = 24.dp)) {
                            Text("Assistant coming next")
                        }
                    }
                }
            }
        }
    }
}