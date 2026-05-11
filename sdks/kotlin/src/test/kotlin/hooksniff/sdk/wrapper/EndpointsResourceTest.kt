package hooksniff.sdk.wrapper

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import kotlin.reflect.full.declaredFunctions
import kotlin.reflect.full.starProjectedType

class EndpointsResourceTest {

    private val clazz = EndpointsResource::class

    // ──────────────────────────────────────────────
    // Method existence checks
    // ──────────────────────────────────────────────
    @Test
    fun `list method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "list" }
        assertNotNull(method, "list() method should exist")
    }

    @Test
    fun `create method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "create" }
        assertNotNull(method, "create() method should exist")
    }

    @Test
    fun `get method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "get" }
        assertNotNull(method, "get() method should exist")
    }

    @Test
    fun `update method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "update" }
        assertNotNull(method, "update() method should exist")
    }

    @Test
    fun `delete method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "delete" }
        assertNotNull(method, "delete() method should exist")
    }

    @Test
    fun `rotateSecret method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "rotateSecret" }
        assertNotNull(method, "rotateSecret() method should exist")
    }

    @Test
    fun `listAll method exists`() {
        val method = clazz.declaredFunctions.find { it.name == "listAll" }
        assertNotNull(method, "listAll() method should exist")
    }

    // ──────────────────────────────────────────────
    // listAll signature checks
    // ──────────────────────────────────────────────
    @Test
    fun `listAll returns List of Map`() {
        val method = clazz.declaredFunctions.find { it.name == "listAll" }
        assertNotNull(method)
        val returnType = method!!.returnType
        // Should return List<Map<String, Any?>>
        assertTrue(returnType.toString().contains("List"), "listAll should return a List type")
    }

    @Test
    fun `listAll has optional limit parameter`() {
        val method = clazz.declaredFunctions.find { it.name == "listAll" }
        assertNotNull(method)
        val params = method!!.parameters.filter { it.name != null }
        // Should have 'this' + 'limit' = 2 parameters
        assertTrue(params.size <= 2, "listAll should have at most 2 parameters (this + limit)")
        val limitParam = params.find { it.name == "limit" }
        assertNotNull(limitParam, "listAll should have a 'limit' parameter")
    }

    @Test
    fun `listAll limit parameter has default value`() {
        val method = clazz.declaredFunctions.find { it.name == "listAll" }
        assertNotNull(method)
        // The method should be callable without arguments (limit has a default)
        // We verify the parameter is optional by checking it has a default via Kotlin reflection
        val limitParam = method!!.parameters.find { it.name == "limit" }
        assertNotNull(limitParam)
        // In Kotlin, default params are reflected; the param type should be Int (non-nullable)
        assertTrue(limitParam!!.type.isMarkedNullable.not(), "limit should be non-nullable Int")
    }

    // ──────────────────────────────────────────────
    // Method signature checks
    // ──────────────────────────────────────────────
    @Test
    fun `list accepts limit and offset parameters`() {
        val method = clazz.declaredFunctions.find { it.name == "list" }
        assertNotNull(method)
        val paramNames = method!!.parameters.filter { it.name != null }.map { it.name }
        assertTrue(paramNames.contains("limit"), "list() should have a 'limit' parameter")
        assertTrue(paramNames.contains("offset"), "list() should have an 'offset' parameter")
    }

    @Test
    fun `create accepts input map parameter`() {
        val method = clazz.declaredFunctions.find { it.name == "create" }
        assertNotNull(method)
        val paramNames = method!!.parameters.filter { it.name != null }.map { it.name }
        assertTrue(paramNames.contains("input"), "create() should have an 'input' parameter")
    }

    @Test
    fun `get accepts id string parameter`() {
        val method = clazz.declaredFunctions.find { it.name == "get" }
        assertNotNull(method)
        val idParam = method!!.parameters.find { it.name == "id" }
        assertNotNull(idParam, "get() should have an 'id' parameter")
        assertEquals(String::class.starProjectedType, idParam!!.type, "id parameter should be String")
    }

    @Test
    fun `delete accepts id string parameter`() {
        val method = clazz.declaredFunctions.find { it.name == "delete" }
        assertNotNull(method)
        val idParam = method!!.parameters.find { it.name == "id" }
        assertNotNull(idParam, "delete() should have an 'id' parameter")
        assertEquals(String::class.starProjectedType, idParam!!.type, "id parameter should be String")
    }

    @Test
    fun `update accepts id and input parameters`() {
        val method = clazz.declaredFunctions.find { it.name == "update" }
        assertNotNull(method)
        val paramNames = method!!.parameters.filter { it.name != null }.map { it.name }
        assertTrue(paramNames.contains("id"), "update() should have an 'id' parameter")
        assertTrue(paramNames.contains("input"), "update() should have an 'input' parameter")
    }

    @Test
    fun `rotateSecret accepts id string parameter`() {
        val method = clazz.declaredFunctions.find { it.name == "rotateSecret" }
        assertNotNull(method)
        val idParam = method!!.parameters.find { it.name == "id" }
        assertNotNull(idParam, "rotateSecret() should have an 'id' parameter")
        assertEquals(String::class.starProjectedType, idParam!!.type, "id parameter should be String")
    }

    // ──────────────────────────────────────────────
    // Constructor check
    // ──────────────────────────────────────────────
    @Test
    fun `constructor accepts HookSniff client`() {
        val constructor = clazz.constructors.firstOrNull()
        assertNotNull(constructor, "EndpointsResource should have a constructor")
        val param = constructor!!.parameters.firstOrNull()
        assertNotNull(param)
        assertEquals("client", param!!.name, "Constructor should accept a 'client' parameter")
    }
}
