cmake_minimum_required(VERSION 3.5.0)
project(crab)

if(DEFINED PACKAGE_FIND_FILE)
    include(${PACKAGE_FIND_FILE})
endif()

add_library(crab SHARED crab.cpp)
target_link_libraries(crab PUBLIC libace_napi.z.so libdl.so)
add_custom_command(TARGET crab POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_SOURCE_DIR}/frida/libgadget.so $<TARGET_FILE_DIR:crab>/libgadget.so
)
