import Link from "next/link"
import { CONFIG } from "site.config"
import styled from "@emotion/styled"

const Logo = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src="/头像.jpeg" alt={CONFIG.blog.title} 
      style={{ 
        width: "35px", height: "35px", borderRadius: "50%", marginRight: "10px"
       }} 
      />

      <StyledWrapper href="/" aria-label={CONFIG.blog.title}>
        {CONFIG.blog.title}
      </StyledWrapper>
    </div>
  )
}

export default Logo

const StyledWrapper = styled(Link)``
