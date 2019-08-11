import styled, { css } from 'styled-components';

export const ChamadosWrapper = styled.div`
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1rem;

  ${props =>
    props.hidden &&
    css`
      display: none;
    `
  }
`

export const Header = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding: 5px 1rem;
`;

export const TableWrapper = styled.div`
  padding: 1rem;
`