#include <dlfcn.h>
#include <cstdlib>
#include <mutex>
#include <string>

#include "napi/native_api.h"

namespace {
constexpr auto *GADGET = "libgadget.so";
constexpr auto *CONFIG = "FRIDA_GADGET_CONFIG";

struct Crab {
    bool attempted = false;
    bool loaded = false;
    std::string gadget = GADGET;
    std::string error;
};

Crab crab;
std::mutex mutex;

std::string Text(napi_env env, napi_value value)
{
    size_t size = 0;
    napi_get_value_string_utf8(env, value, nullptr, 0, &size);
    std::string text(size + 1, '\0');
    napi_get_value_string_utf8(env, value, &text[0], text.size(), &size);
    text.resize(size);
    return text;
}

void SetBoolProperty(napi_env env, napi_value object, const char *key, bool value)
{
    napi_value item = nullptr;
    napi_get_boolean(env, value, &item);
    napi_set_named_property(env, object, key, item);
}

void SetStringProperty(napi_env env, napi_value object, const char *key, const std::string &value)
{
    napi_value item = nullptr;
    napi_create_string_utf8(env, value.c_str(), NAPI_AUTO_LENGTH, &item);
    napi_set_named_property(env, object, key, item);
}

napi_value Pack(napi_env env)
{
    napi_value object = nullptr;
    napi_create_object(env, &object);
    SetBoolProperty(env, object, "attempted", crab.attempted);
    SetBoolProperty(env, object, "loaded", crab.loaded);
    SetStringProperty(env, object, "gadgetName", crab.gadget);
    SetStringProperty(env, object, "lastError", crab.error);
    return object;
}

void Load(const std::string &gadget)
{
    crab.attempted = true;
    crab.gadget = gadget.empty() ? GADGET : gadget;
    crab.error.clear();
    dlerror();
    auto handle = dlopen(crab.gadget.c_str(), RTLD_NOW | RTLD_GLOBAL);
    crab.loaded = handle != nullptr;
    if (crab.loaded) return;
    const char *error = dlerror();
    crab.error = error == nullptr ? "" : error;
}

napi_value Bootstrap(napi_env env, napi_callback_info info)
{
    size_t argc = 2;
    napi_value args[2] = {nullptr};
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    auto gadget = argc >= 1 ? Text(env, args[0]) : GADGET;
    auto config = argc >= 2 ? Text(env, args[1]) : "";
    std::lock_guard<std::mutex> hold(mutex);
    if (!config.empty()) setenv(CONFIG, config.c_str(), 1);
    if (!crab.loaded || gadget != crab.gadget) Load(gadget);
    return Pack(env);
}

napi_value Status(napi_env env, napi_callback_info info)
{
    (void)info;
    std::lock_guard<std::mutex> hold(mutex);
    return Pack(env);
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports)
{
    napi_property_descriptor props[] = {
        { "bootstrap", nullptr, Bootstrap, nullptr, nullptr, nullptr, napi_default, nullptr },
        { "status", nullptr, Status, nullptr, nullptr, nullptr, napi_default, nullptr },
    };
    napi_define_properties(env, exports, 2, props);
    return exports;
}
EXTERN_C_END

static napi_module module = {1, 0, nullptr, Init, "crab", nullptr, {0}};
} // namespace

extern "C" __attribute__((constructor)) void BootCrab(void) { napi_module_register(&module); }
