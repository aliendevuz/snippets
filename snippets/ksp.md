# Kotlin Symbol Processing (KSP)

Complete setup and configuration for Kotlin Symbol Processing with annotation processing examples.

## Gradle Configuration

```kotlin
// build.gradle.kts (Module level)
plugins {
    id("com.google.devtools.ksp") version "1.9.20-1.0.14"
    kotlin("jvm")
}

dependencies {
    // KSP API for writing processors
    implementation("com.google.devtools.ksp:symbol-processing-api:1.9.20-1.0.14")
    
    // For annotation processing
    ksp("your.processor:annotation-processor:1.0.0")
    
    // Common annotations
    implementation("javax.annotation:javax.annotation-api:1.3.2")
}

// Configure KSP
ksp {
    arg("option1", "value1")
    arg("option2", "value2")
}
```

## Custom Annotation

```kotlin
// annotations/AutoService.kt
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.SOURCE)
annotation class AutoService(
    val value: String = "",
    val singleton: Boolean = false
)

// annotations/GenerateBuilder.kt
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.SOURCE)
annotation class GenerateBuilder
```

## KSP Processor Implementation

```kotlin
// processor/AutoServiceProcessor.kt
import com.google.devtools.ksp.processing.*
import com.google.devtools.ksp.symbol.*
import com.google.devtools.ksp.validate

class AutoServiceProcessor(
    private val codeGenerator: CodeGenerator,
    private val logger: KSPLogger
) : SymbolProcessor {
    
    override fun process(resolver: Resolver): List<KSAnnotated> {
        val symbols = resolver.getSymbolsWithAnnotation("com.example.AutoService")
        val ret = mutableListOf<KSAnnotated>()
        
        symbols.forEach { symbol ->
            if (!symbol.validate()) {
                ret.add(symbol)
                return@forEach
            }
            
            if (symbol is KSClassDeclaration) {
                processAutoService(symbol)
            }
        }
        
        return ret
    }
    
    private fun processAutoService(classDeclaration: KSClassDeclaration) {
        val packageName = classDeclaration.containingFile?.packageName?.asString() ?: ""
        val className = classDeclaration.simpleName.asString()
        val annotation = classDeclaration.annotations.first { 
            it.shortName.asString() == "AutoService" 
        }
        
        val serviceName = annotation.arguments.find { 
            it.name?.asString() == "value" 
        }?.value as? String ?: ""
        
        val isSingleton = annotation.arguments.find { 
            it.name?.asString() == "singleton" 
        }?.value as? Boolean ?: false
        
        generateServiceClass(packageName, className, serviceName, isSingleton)
    }
    
    private fun generateServiceClass(
        packageName: String,
        className: String,
        serviceName: String,
        isSingleton: Boolean
    ) {
        val fileName = "${className}Service"
        val file = codeGenerator.createNewFile(
            Dependencies(false),
            packageName,
            fileName
        )
        
        file.bufferedWriter().use { writer ->
            writer.write("""
                package $packageName
                
                class ${fileName} {
                    ${if (isSingleton) """
                    companion object {
                        @Volatile
                        private var INSTANCE: $fileName? = null
                        
                        fun getInstance(): $fileName {
                            return INSTANCE ?: synchronized(this) {
                                val instance = $fileName()
                                INSTANCE = instance
                                instance
                            }
                        }
                    }
                    """ else ""}
                    
                    fun execute(): String {
                        return "Service: $serviceName executed by $className"
                    }
                }
            """.trimIndent())
        }
        
        logger.info("Generated service class: $fileName")
    }
}
```

## Processor Provider

```kotlin
// processor/AutoServiceProcessorProvider.kt
import com.google.devtools.ksp.processing.SymbolProcessor
import com.google.devtools.ksp.processing.SymbolProcessorEnvironment
import com.google.devtools.ksp.processing.SymbolProcessorProvider

class AutoServiceProcessorProvider : SymbolProcessorProvider {
    override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor {
        return AutoServiceProcessor(
            environment.codeGenerator,
            environment.logger
        )
    }
}
```

## Usage Example

```kotlin
// Example usage of the annotation
@AutoService(value = "UserManagement", singleton = true)
class UserController {
    fun getUsers(): List<String> {
        return listOf("User1", "User2", "User3")
    }
}

@GenerateBuilder
data class User(
    val id: Long,
    val name: String,
    val email: String,
    val age: Int
)

// Generated code will be available after compilation
fun main() {
    val service = UserControllerService.getInstance()
    println(service.execute())
    
    // If GenerateBuilder processor exists:
    val user = UserBuilder()
        .setId(1L)
        .setName("John Doe")
        .setEmail("john@example.com")
        .setAge(30)
        .build()
}
```

## Advanced KSP Features

```kotlin
// Working with type parameters and generics
private fun processGenericClass(declaration: KSClassDeclaration) {
    declaration.typeParameters.forEach { typeParam ->
        logger.info("Type parameter: ${typeParam.name.asString()}")
        typeParam.bounds.forEach { bound ->
            logger.info("Bound: ${bound.resolve()}")
        }
    }
}

// Processing functions and properties
private fun processFunctions(declaration: KSClassDeclaration) {
    declaration.getAllFunctions().forEach { function ->
        logger.info("Function: ${function.simpleName.asString()}")
        function.parameters.forEach { param ->
            logger.info("Parameter: ${param.name?.asString()} : ${param.type.resolve()}")
        }
    }
}

// Working with annotations
private fun getAnnotationValue(annotation: KSAnnotation, name: String): Any? {
    return annotation.arguments.find { 
        it.name?.asString() == name 
    }?.value
}
```
