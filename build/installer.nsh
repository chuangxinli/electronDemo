!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation $WINDIR
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation $WINDIR
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation $WINDIR
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation $WINDIR
!macroend